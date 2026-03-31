/**
 * author-landing.ts — 3-layer system prompt for author landing page generation.
 *
 * Toon format reference: §2 (System), §3 (User), §4 (Tool/Structured Output)
 * Artifact: lib/schemas/author-landing.ts (authorLandingContentSchema)
 *
 * Layer 1 — System: role, voice constraints, banned words, few-shot anchor, narrative structure.
 * Layer 2 — User message: author data + admin custom prompt. Built at call time.
 * Layer 3 — Structured output: tool_use with JSON schema derived from authorLandingContentSchema.
 */

import type { AuthorLandingContent } from '@/lib/schemas/author-landing'

// ─── Layer 1: System Prompt ───────────────────────────────────────────────────

export const AUTHOR_LANDING_SYSTEM_PROMPT = `You are a copywriter specializing in independent artists, craftspeople, and creative entrepreneurs.
Your copy is concrete, sensory, and specific — never abstract or generic.

BANNED WORDS (never use these):
único, auténtico, pasión, journey, trayectoria, timeless, authentic, unique, passion, soulful, heartfelt, innovative, transformative

VOICE RULES:
- Lead with concrete sensory detail, not abstract adjectives.
- Every sentence must earn its place — cut anything that could apply to any artist.
- Short sentences punch harder. Long sentences unravel.
- The bio is a story, not a résumé.

NARRATIVE STRUCTURE (mandatory for all bio content):
1. Origin — a specific moment, place, or material that started everything (NOT "desde pequeño/a...")
2. Turning Point — one decision or accident that changed the direction
3. Method — how they actually work: the materials, the process, the obsession
4. Invitation — what the reader/buyer gains from this person's work (not "calidad" — be specific)

FEW-SHOT EXAMPLES of approved copy:

Example A — Short bio (117 chars):
"Cut canvas in a garage in Mendoza. Forty failed prints before the first one sold. Now her patterns cover walls in twelve countries."

Example B — Short bio (112 chars):
"Learned leatherwork to fix a broken saddle. Couldn't stop. Now every stitch is a small argument against disposability."

Example C — Headline (48 chars):
"Ceramics fired in the same kiln since 1987"

Example D — Headline (52 chars):
"Prints made by hand. No two ever the same."

WHAT TO AVOID:
- "Artista apasionado/a por su arte"
- "Con años de experiencia en el sector"
- "Cada pieza cuenta una historia única"
- Headlines that start with a name
- Bios that open with birth year or birthplace

OUTPUT FORMAT:
You must call the extract_landing_content tool with the structured data.
All character limits are hard constraints — never exceed them.
Write in the same language as the author name and product names suggest (Spanish if LATAM, English otherwise).
When in doubt, default to Spanish.`

// ─── Layer 2: User Message Builder ───────────────────────────────────────────

export interface AuthorLandingUserContext {
  authorName: string
  products: Array<{ name: string; category: string }>
  customPrompt?: string
}

export function buildAuthorLandingUserMessage(ctx: AuthorLandingUserContext): string {
  const productList =
    ctx.products.length > 0
      ? ctx.products.map((p) => `- ${p.name} (${p.category})`).join('\n')
      : '(no products yet)'

  const adminGuidance = ctx.customPrompt
    ? `\nAdmin guidance (tone, focus, specific details to highlight):\n${ctx.customPrompt}`
    : ''

  return `Generate a landing page for this author.

Author name: ${ctx.authorName}

Products:
${productList}
${adminGuidance}

Call the extract_landing_content tool with the complete landing content.`
}

// ─── Layer 3: Tool Schema (Structured Output) ─────────────────────────────────

export const AUTHOR_LANDING_TOOL = {
  name: 'extract_landing_content',
  description: 'Extract structured landing page content for an author.',
  input_schema: {
    type: 'object' as const,
    required: ['hero', 'bio', 'seo'],
    properties: {
      hero: {
        type: 'object',
        required: ['headline', 'subheadline', 'cta_text'],
        properties: {
          headline: {
            type: 'string',
            description: 'Main hero headline. Max 60 chars. No author name. Concrete + specific.',
            maxLength: 60,
          },
          subheadline: {
            type: 'string',
            description: 'Supporting line expanding the headline. Max 200 chars.',
            maxLength: 200,
          },
          cta_text: {
            type: 'string',
            description: 'Call-to-action button text. Max 40 chars. Action verb first.',
            maxLength: 40,
          },
        },
      },
      bio: {
        type: 'object',
        required: ['short', 'long'],
        properties: {
          short: {
            type: 'string',
            description:
              'Short bio for cards/previews. Max 120 chars. Must follow Origin→Turning Point arc compressed.',
            maxLength: 120,
          },
          long: {
            type: 'string',
            description:
              'Full bio. Max 600 chars. Narrative arc: Origin → Turning Point → Method → Invitation.',
            maxLength: 600,
          },
        },
      },
      seo: {
        type: 'object',
        required: ['meta_title', 'meta_description'],
        properties: {
          meta_title: {
            type: 'string',
            description: 'SEO meta title. Max 60 chars. Include author name + main product type.',
            maxLength: 60,
          },
          meta_description: {
            type: 'string',
            description:
              'SEO meta description. Max 155 chars. Describe what they make + who it is for.',
            maxLength: 155,
          },
        },
      },
    },
  },
} as const

// ─── Type guard to validate tool output ──────────────────────────────────────

export function isAuthorLandingContent(v: unknown): v is AuthorLandingContent {
  return typeof v === 'object' && v !== null && 'hero' in v && 'bio' in v && 'seo' in v
}
