/**
 * Dashboard Authors (Artistas) Page — author landing editor.
 * Route: /[locale]/[tenantId]/dashboard/authors
 *
 * Feature-gated: requires Flags.AUTHOR_LANDINGS enabled (DB or env var).
 */

import { notFound } from 'next/navigation'
import { AuthorLandingEditor } from '@/components/dashboard/authors/AuthorLandingEditor'
import { Flags, isEnabled } from '@/lib/flags'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export default async function AuthorsPage({ params }: PageProps) {
  const { tenantId, locale } = await params
  const supabase = await createClient()

  // Resolve tenant
  const numericId = Number(tenantId)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, template')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) notFound()

  // Guard: feature must be enabled for this tenant
  const flagEnabled = await isEnabled(Flags.AUTHOR_LANDINGS, {
    tenantId: tenant.id,
    tenantTemplate: tenant.template,
  })

  if (!flagEnabled) notFound()

  return (
    <AuthorLandingEditor
      tenantId={tenant.id}
      tenantSlug={tenant.slug ?? tenantId}
      locale={locale}
    />
  )
}
