/**
 * Dashboard Authors Page — author landing editor.
 * Route: /[locale]/[tenantId]/dashboard/authors
 */

import { notFound } from 'next/navigation'
import { AuthorLandingEditor } from '@/components/dashboard/authors/AuthorLandingEditor'
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
    .select('id, slug')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) notFound()

  return (
    <AuthorLandingEditor
      tenantId={tenant.id}
      tenantSlug={tenant.slug ?? tenantId}
      locale={locale}
    />
  )
}
