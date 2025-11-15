import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from 'sonner'

export default async function TenantLayout({
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

  // Supabase client with cookies (Next.js 16 compatible)
  const supabase = await createClient()

  // Only fetch tenant if tenantId is valid
  const { data: tenant } = tenantId
    ? await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()
    : { data: null }

  // Type assertion for JSONB config field
  const config = tenant?.config as { colors?: { primary?: string; secondary?: string }; logo?: string } | null
  const primaryColor = config?.colors?.primary || '#3B82F6'
  const secondaryColor = config?.colors?.secondary || '#10B981'

  return (
    <div>
      {/* CSS custom properties for tenant theming */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --color-primary: ${primaryColor};
          --color-secondary: ${secondaryColor};
        }
      `}} />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {config?.logo && (
            <img src={config.logo as string} alt={tenant?.name || 'Store'} className="h-12" />
          )}
          <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
            {tenant?.name}
          </h1>
        </div>
      </header>

      <main>{children}</main>
      <Toaster position="bottom-center" />

      <footer className="bg-gray-50 mt-12 py-6 text-center text-gray-600">
        <p>&copy; 2025 {tenant?.name}. Powered by Vendio.</p>
      </footer>
    </div>
  )
}
