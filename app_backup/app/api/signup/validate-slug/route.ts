/**
 * POST /api/signup/validate-slug - Check Slug Availability
 *
 * Validates slug format and checks uniqueness in tenants table.
 * Provides suggestions if slug is already taken.
 *
 * Validation Rules:
 * - Min 3 chars, max 30 chars
 * - Only lowercase letters, numbers, hyphens
 * - Cannot start/end with hyphen
 * - No consecutive hyphens
 *
 * Returns:
 * - available: boolean - whether slug is available
 * - suggestion?: string - alternative slug if taken (slug-2, slug-3, etc.)
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { slugSchema, validateSlugRequestSchema } from '@/lib/schemas/order'
import type { Database } from '@/types/supabase'

// Service role client for checking slug uniqueness
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

/**
 * Generate slug suggestions by appending incrementing numbers
 * e.g., "mystore" -> "mystore-2", "mystore-3", etc.
 */
async function generateSlugSuggestion(baseSlug: string): Promise<string | undefined> {
  // Try up to 10 suggestions
  for (let i = 2; i <= 10; i++) {
    const suggestion = `${baseSlug}-${i}`

    // Check if suggestion is available
    const { data } = await supabaseAdmin
      .from('tenants')
      .select('slug')
      .eq('slug', suggestion)
      .single()

    if (!data) {
      return suggestion
    }
  }

  return undefined // No available suggestions found
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = validateSlugRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error.issues[0].message }, { status: 400 })
    }

    const { slug } = validationResult.data

    // Validate slug format
    const slugFormatResult = slugSchema.safeParse(slug)

    if (!slugFormatResult.success) {
      return NextResponse.json(
        {
          available: false,
          error: slugFormatResult.error.issues[0].message,
        },
        { status: 200 }, // 200 OK but validation failed
      )
    }

    // Check uniqueness in database
    const { data: existingTenant, error: dbError } = await supabaseAdmin
      .from('tenants')
      .select('slug')
      .eq('slug', slug)
      .single()

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (slug is available)
      console.error('Database error checking slug:', dbError)
      return NextResponse.json({ error: 'Failed to check slug availability' }, { status: 500 })
    }

    // If slug exists, generate suggestion
    if (existingTenant) {
      const suggestion = await generateSlugSuggestion(slug)

      return NextResponse.json({
        available: false,
        suggestion,
      })
    }

    // Slug is available!
    return NextResponse.json({
      available: true,
    })
  } catch (error) {
    console.error('Slug validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
