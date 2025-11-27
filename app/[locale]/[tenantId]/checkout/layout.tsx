/**
 * Checkout Layout
 *
 * Blocks search engine indexing for checkout routes.
 * Sprint: MII_1-2.5 (SEO Richness)
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
