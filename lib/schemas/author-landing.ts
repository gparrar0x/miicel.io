/**
 * author-landing.ts — shared Zod schema for Claude-generated author landing content.
 * Used by: API routes, author-landing-service, and tests.
 */

import { z } from 'zod'

export const authorLandingContentSchema = z.object({
  hero: z.object({
    headline: z.string().min(1).max(60, 'headline max 60 chars'),
    subheadline: z.string().min(1).max(200, 'subheadline max 200 chars'),
    cta_text: z.string().min(1).max(40, 'cta_text max 40 chars'),
  }),
  bio: z.object({
    short: z.string().min(1).max(120, 'short bio max 120 chars'),
    long: z.string().min(1).max(600, 'long bio max 600 chars'),
  }),
  seo: z.object({
    meta_title: z.string().min(1).max(60, 'meta_title max 60 chars'),
    meta_description: z.string().min(1).max(155, 'meta_description max 155 chars'),
  }),
})

export type AuthorLandingContent = z.infer<typeof authorLandingContentSchema>

// --- Author CRUD schemas ---

export const authorCreateSchema = z.object({
  tenant_id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  image_url: z.string().url().nullable().optional(),
})

export const authorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens')
    .optional(),
  image_url: z.string().url().nullable().optional(),
})

export const generateLandingRequestSchema = z.object({
  custom_prompt: z.string().max(1000).optional(),
})

export type AuthorCreateInput = z.infer<typeof authorCreateSchema>
export type AuthorUpdateInput = z.infer<typeof authorUpdateSchema>
export type GenerateLandingRequest = z.infer<typeof generateLandingRequestSchema>
