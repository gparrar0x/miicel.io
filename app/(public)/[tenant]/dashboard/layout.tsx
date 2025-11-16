import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  // Await params (Next.js 16)
  const { tenant: tenantSlug } = await params

  // Await headers (Next.js 16)
  const headersList = await headers()
  const tenantIdHeader = headersList.get('x-tenant-id')
  const tenantId = tenantIdHeader ? parseInt(tenantIdHeader) : null

  // Create Supabase client
  const supabase = await createClient()

  // Verify authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect(`/${tenantSlug}/login`)
  }

  // Fetch tenant info
  const { data: tenant } = tenantId
    ? await supabase
        .from('tenants')
        .select('name, config')
        .eq('id', tenantId)
        .single()
    : { data: null }

  // Type assertion for JSONB config field
  const config = tenant?.config as {
    business_name?: string
    logo?: string
  } | null

  const businessName = config?.business_name || tenant?.name || 'Admin Panel'
  const logo = config?.logo

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        tenant={tenantSlug}
        tenantName={businessName}
        tenantLogo={logo}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Content Area with mobile top padding for header */}
        <main className="pt-14 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}
