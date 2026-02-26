/**
 * ProductStructuredData Component
 *
 * JSON-LD schema markup for Google rich snippets.
 * Includes Product, Offer, and Brand schema types.
 *
 * Sprint: MII_1-2.3 (SEO Richness)
 */

interface ProductStructuredDataProps {
  product: {
    id: string
    name: string
    description?: string | null
    price: number
    currency: string
    images: string[]
    stock: number
  }
  tenant: {
    slug: string
    businessName: string
  }
  locale: string
}

export function ProductStructuredData({ product, tenant, locale }: ProductStructuredDataProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.images?.[0] || '',
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: product.currency || 'ARS',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://miicel.io/${locale}/${tenant.slug}/p/${product.id}`,
    },
    brand: {
      '@type': 'Brand',
      name: tenant.businessName,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
