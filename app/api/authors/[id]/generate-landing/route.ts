/**
 * POST /api/authors/[id]/generate-landing
 * Calls Claude API, stores draft, returns content JSON.
 */

export const maxDuration = 60

import { NextResponse } from 'next/server'
import { isSuperadmin } from '@/lib/auth/constants'
import {
  authorLandingContentSchema,
  generateLandingRequestSchema,
} from '@/lib/schemas/author-landing'
import {
  AUTHOR_LANDING_SYSTEM_PROMPT,
  AUTHOR_LANDING_TOOL,
  buildAuthorLandingUserMessage,
  isAuthorLandingContent,
} from '@/lib/prompts/author-landing'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isNaN(n) ? null : n
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authorId = parseId(id)
    if (authorId === null) {
      return NextResponse.json({ error: 'Invalid author ID.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = generateLandingRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const admin = createServiceRoleClient()

    // Get author
    const { data: author } = await admin
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .maybeSingle()
    if (!author) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    // Tenant ownership check
    const { data: tenant } = await admin
      .from('tenants')
      .select('id, owner_id')
      .eq('id', author.tenant_id)
      .maybeSingle()

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 })
    }

    const isSuperadminUser = isSuperadmin(user.email)
    if (!isSuperadminUser && tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this tenant.' }, { status: 403 })
    }

    // Fetch author's products for context
    const { data: products } = await admin
      .from('products')
      .select('name, category')
      .eq('author_id', authorId)
      .eq('active', true)

    const userMessage = buildAuthorLandingUserMessage({
      authorName: author.name,
      products: (products ?? []) as Array<{ name: string; category: string }>,
      customPrompt: parsed.data.custom_prompt,
    })

    // Dynamic import to avoid module-level SDK load
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: AUTHOR_LANDING_SYSTEM_PROMPT,
      tools: [AUTHOR_LANDING_TOOL as any],
      tool_choice: { type: 'tool', name: AUTHOR_LANDING_TOOL.name },
      messages: [{ role: 'user', content: userMessage }],
    })

    const toolBlock = response.content.find((b) => b.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new Error('Claude did not return structured output')
    }

    const rawContent = toolBlock.input
    if (!isAuthorLandingContent(rawContent)) {
      throw new Error('Claude tool output missing required fields')
    }

    const validated = authorLandingContentSchema.parse(rawContent)

    // Persist to DB
    const { data: landing, error: insertError } = await admin
      .from('author_landings')
      .insert({
        author_id: authorId,
        content: validated,
        status: 'draft',
      })
      .select()
      .single()

    if (insertError || !landing) {
      throw new Error(`Failed to persist landing: ${insertError?.message ?? 'Unknown'}`)
    }

    return NextResponse.json({ landing }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/authors/[id]/generate-landing error:', err)

    if (err.message?.includes('Author not found')) {
      return NextResponse.json({ error: 'Author not found.' }, { status: 404 })
    }

    if (err.message?.includes('Claude') || err.message?.includes('structured output')) {
      return NextResponse.json(
        { error: 'AI generation failed. Please try again.' },
        { status: 502 },
      )
    }

    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
