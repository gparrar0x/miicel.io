import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SocialDashboardPage } from '@/components/social'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ tenantId: string; locale: string }>
}

export const metadata: Metadata = {
  title: 'Social Media Manager',
  description: 'Publish to Instagram, schedule posts, and track engagement',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function SocialPage({ params }: PageProps) {
  const { tenantId } = await params
  const supabase = await createClient()

  const numericId = parseInt(tenantId, 10)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug, name')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantId)
    .single()

  if (!tenant) {
    notFound()
  }

  return <SocialDashboardPage tenantId={tenant.id} />
}
