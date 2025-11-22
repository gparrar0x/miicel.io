/**
 * Admin Settings > Appearance Page
 *
 * Allows tenant OWNER to customize storefront theme:
 * - Choose template (gallery/detail/minimal)
 * - Customize theme overrides (colors, spacing, grid, etc)
 * - Live preview of changes
 *
 * Auth: OWNER role only
 * API: GET/PATCH /api/tenants/[slug]/theme
 *
 * Created: 2025-11-16 (Issue #6, Task #3)
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThemeEditorClient } from '@/components/admin/ThemeEditorClient'

export default async function AppearanceSettingsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>
}) {
  const { tenantId } = await params
  const supabase = await createClient()

  // Step 1: Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/${tenantId}`)
  }

  // Step 2: Fetch tenant and verify OWNER role
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, slug, template, theme_overrides, tenant_users!inner(user_id, role)')
    .eq('slug', tenantId)
    .eq('active', true)
    .eq('tenant_users.user_id', user.id)
    .maybeSingle()

  if (tenantError || !tenant) {
    redirect(`/${tenantId}`)
  }

  // Check OWNER role
  const tenantUsers = tenant.tenant_users as unknown as Array<{ user_id: string; role: string }>
  const userRole = tenantUsers.find((tu) => tu.user_id === user.id)?.role

  if (userRole !== 'OWNER') {
    redirect(`/${tenantId}`)
  }

  // Step 3: Pass initial theme data to client component
  const initialTheme = {
    template: tenant.template as 'gallery' | 'detail' | 'minimal',
    overrides: (tenant.theme_overrides as Record<string, any>) || {},
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appearance Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customize your storefront template and theme to match your brand
          </p>
        </div>

        <ThemeEditorClient tenantSlug={tenant.slug} initialTheme={initialTheme} />
      </div>
    </div>
  )
}
