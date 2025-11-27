/**
 * Dashboard Layout
 *
 * Blocks search engine indexing for admin/dashboard routes.
 * Sprint: MII_1-2.5 (SEO Richness)
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
