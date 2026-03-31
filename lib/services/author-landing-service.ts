/**
 * AuthorLandingService — orchestrates prompt build + Claude API call + validation + DB persistence.
 * Pattern: thin API route → this service → Supabase client.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

import { authorLandingContentSchema } from '@/lib/schemas/author-landing'
import type { AuthorLandingContent } from '@/lib/schemas/author-landing'
import {
  AUTHOR_LANDING_SYSTEM_PROMPT,
  AUTHOR_LANDING_TOOL,
  buildAuthorLandingUserMessage,
  isAuthorLandingContent,
} from '@/lib/prompts/author-landing'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthorRow {
  id: number
  tenant_id: number
  name: string
  slug: string
  image_url: string | null
  created_at: string
}

export interface AuthorLandingRow {
  id: number
  author_id: number
  content: AuthorLandingContent
  status: 'draft' | 'published'
  generated_at: string
  published_at: string | null
}

export interface AuthorWithLanding extends AuthorRow {
  latest_landing: Pick<AuthorLandingRow, 'id' | 'status' | 'generated_at'> | null
}

export interface CreateAuthorInput {
  tenant_id: number
  name: string
  slug: string
  image_url?: string | null
}

export interface UpdateAuthorInput {
  name?: string
  slug?: string
  image_url?: string | null
}

export interface GenerateLandingInput {
  authorId: number
  customPrompt?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthorLandingService {
  private _anthropic: Anthropic | null = null

  constructor(private readonly supabase: SupabaseClient) {}

  private get anthropic(): Anthropic {
    if (!this._anthropic) {
      this._anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    }
    return this._anthropic
  }

  // ── Authors CRUD ────────────────────────────────────────────────────────────

  async listAuthors(tenantId: number): Promise<AuthorWithLanding[]> {
    // Fetch authors + their most recent landing (status + generated_at)
    const { data, error } = await this.supabase
      .from('authors')
      .select(
        `
        id, tenant_id, name, slug, image_url, created_at,
        author_landings(id, status, generated_at)
      `,
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to list authors: ${error.message}`)

    return ((data ?? []) as any[]).map((row) => {
      const landings: AuthorLandingRow[] = row.author_landings ?? []
      const latest = landings.sort(
        (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime(),
      )[0]

      return {
        id: row.id,
        tenant_id: row.tenant_id,
        name: row.name,
        slug: row.slug,
        image_url: row.image_url,
        created_at: row.created_at,
        latest_landing: latest
          ? { id: latest.id, status: latest.status, generated_at: latest.generated_at }
          : null,
      }
    })
  }

  async createAuthor(input: CreateAuthorInput): Promise<AuthorRow> {
    const { data, error } = await this.supabase
      .from('authors')
      .insert({
        tenant_id: input.tenant_id,
        name: input.name,
        slug: input.slug,
        image_url: input.image_url ?? null,
      })
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to create author: ${error?.message ?? 'Unknown'}`)
    return data as AuthorRow
  }

  async getAuthor(authorId: number): Promise<AuthorRow | null> {
    const { data, error } = await this.supabase
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .maybeSingle()

    if (error) throw new Error(`Failed to fetch author: ${error.message}`)
    return (data as AuthorRow) ?? null
  }

  async updateAuthor(authorId: number, input: UpdateAuthorInput): Promise<AuthorRow> {
    const { data, error } = await this.supabase
      .from('authors')
      .update(input)
      .eq('id', authorId)
      .select()
      .single()

    if (error || !data) throw new Error(`Failed to update author: ${error?.message ?? 'Unknown'}`)
    return data as AuthorRow
  }

  async deleteAuthor(authorId: number): Promise<void> {
    const { error } = await this.supabase.from('authors').delete().eq('id', authorId)
    if (error) throw new Error(`Failed to delete author: ${error.message}`)
  }

  // ── Landing Generation ──────────────────────────────────────────────────────

  async generateLanding(input: GenerateLandingInput): Promise<AuthorLandingRow> {
    const author = await this.getAuthor(input.authorId)
    if (!author) throw new Error('Author not found')

    // Fetch author's products for context
    const { data: products } = await this.supabase
      .from('products')
      .select('name, category')
      .eq('author_id', input.authorId)
      .eq('active', true)

    const userMessage = buildAuthorLandingUserMessage({
      authorName: author.name,
      products: (products ?? []) as Array<{ name: string; category: string }>,
      customPrompt: input.customPrompt,
    })

    // Call Claude with tool_use structured output
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: AUTHOR_LANDING_SYSTEM_PROMPT,
      tools: [AUTHOR_LANDING_TOOL as any],
      tool_choice: { type: 'tool', name: AUTHOR_LANDING_TOOL.name },
      messages: [{ role: 'user', content: userMessage }],
    })

    // Extract tool_use block
    const toolBlock = response.content.find((b) => b.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Claude did not return structured output')
    }

    const rawContent = toolBlock.input

    if (!isAuthorLandingContent(rawContent)) {
      throw new Error('Claude tool output missing required fields')
    }

    // Zod validation (hard constraint — rejects if any field exceeds maxLength)
    const validated = authorLandingContentSchema.parse(rawContent)

    // Persist to DB
    const { data: landing, error: insertError } = await this.supabase
      .from('author_landings')
      .insert({
        author_id: input.authorId,
        content: validated,
        status: 'draft',
      })
      .select()
      .single()

    if (insertError || !landing) {
      throw new Error(`Failed to persist landing: ${insertError?.message ?? 'Unknown'}`)
    }

    return landing as AuthorLandingRow
  }

  // ── Publish ─────────────────────────────────────────────────────────────────

  async publishLanding(authorId: number): Promise<AuthorLandingRow> {
    // Get most recent landing for this author
    const { data: landings, error: fetchError } = await this.supabase
      .from('author_landings')
      .select('*')
      .eq('author_id', authorId)
      .order('generated_at', { ascending: false })
      .limit(1)

    if (fetchError) throw new Error(`Failed to fetch landing: ${fetchError.message}`)
    if (!landings || landings.length === 0) throw new Error('No landing found for this author')

    const landing = landings[0]

    const { data: updated, error: updateError } = await this.supabase
      .from('author_landings')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', landing.id)
      .select()
      .single()

    if (updateError || !updated) {
      throw new Error(`Failed to publish landing: ${updateError?.message ?? 'Unknown'}`)
    }

    return updated as AuthorLandingRow
  }
}
