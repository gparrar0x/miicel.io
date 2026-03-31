/**
 * Public Author Landing Page
 * Route: /[locale]/[tenantId]/a/[slug]
 *
 * RSC — zero client JS. ISR with 1h revalidation.
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuthorLanding } from '@/components/storefront/AuthorLanding'
import type { AuthorLandingContent } from '@/lib/schemas/author-landing'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ locale: string; tenantId: string; slug: string }>
}

async function getAuthorLanding(tenantSlug: string, authorSlug: string) {
  const supabase = await createClient()

  // Resolve tenant
  const numericId = Number(tenantSlug)
  const isNumeric = !Number.isNaN(numericId)

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, slug')
    .eq(isNumeric ? 'id' : 'slug', isNumeric ? numericId : tenantSlug)
    .single()

  if (!tenant) return null

  // Get author by slug + tenant
  const { data: author } = await supabase
    .from('authors')
    .select('id, name, slug, image_url, tenant_id')
    .eq('tenant_id', tenant.id)
    .eq('slug', authorSlug)
    .single()

  if (!author) return null

  // Get latest published landing
  const { data: landings } = await supabase
    .from('author_landings')
    .select('content, status')
    .eq('author_id', author.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)

  if (!landings || landings.length === 0) return null

  return {
    tenant,
    author,
    content: landings[0].content as AuthorLandingContent,
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tenantId, slug } = await params
  const data = await getAuthorLanding(tenantId, slug)

  if (!data) {
    return { title: 'Author Not Found' }
  }

  const { content, author } = data
  const baseUrl = `https://micelio.skyw.app/${locale}/${tenantId}/a/${slug}`

  return {
    title: content.seo.meta_title,
    description: content.seo.meta_description,
    metadataBase: new URL('https://micelio.skyw.app'),
    openGraph: {
      title: content.seo.meta_title,
      description: content.seo.meta_description,
      type: 'profile',
      url: baseUrl,
      images: author.image_url ? [{ url: author.image_url, width: 1200, height: 630 }] : [],
    },
    alternates: {
      canonical: baseUrl,
    },
  }
}

export default async function AuthorLandingPage({ params }: PageProps) {
  const { locale, tenantId, slug } = await params
  const data = await getAuthorLanding(tenantId, slug)

  if (!data) notFound()

  const { content, author, tenant } = data
  const ctaHref = `/${locale}/${tenant.slug ?? tenantId}/?artist=${encodeURIComponent(author.name)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `https://micelio.skyw.app/${locale}/${tenantId}/a/${slug}`,
    image: author.image_url ?? undefined,
    description: content.seo.meta_description,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthorLanding
        content={content}
        authorName={author.name}
        authorImage={author.image_url}
        ctaHref={ctaHref}
      />
    </>
  )
}
