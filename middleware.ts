import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type TenantData = {
  id: number
  slug: string
  name: string
  config: any
  active: boolean
  owner_id: string
}

type CachedTenant = TenantData & { expires: number }

const tenantCache = new Map<string, CachedTenant>()
const CACHE_TTL = 60000

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: req,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if needed
  await supabase.auth.getUser()

  const pathSegments = req.nextUrl.pathname.split('/').filter(Boolean)

  // Skip tenant logic for API routes, signup, test pages, login page, dashboard (superadmin), and root
  if (pathSegments[0] === 'api' || 
      pathSegments[0] === 'signup' || 
      pathSegments[0] === 'test-theme' || 
      pathSegments[0] === 'login' || 
      pathSegments[0] === 'dashboard' || 
      pathSegments[0] === 'tenants' ||
      !pathSegments[0]) {
    return supabaseResponse
  }

  const tenantSlug = pathSegments[0]

  // Check if we should bypass cache
  // 1. Header-based bypass (for API calls)
  // 2. Query param _t bypass (for redirects after activation)
  const bypassCache =
    req.headers.get('x-bypass-tenant-cache') === 'true' ||
    req.nextUrl.searchParams.has('_t')

  const cached = tenantCache.get(tenantSlug)
  let tenant: TenantData

  if (cached && cached.expires > Date.now() && !bypassCache) {
    tenant = cached
  } else {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, slug, name, config, active, owner_id, updated_at')
      .eq('slug', tenantSlug)
      .single()

    if (error || !data) {
      return NextResponse.redirect(new URL('/404', req.url))
    }

    if (!data.active) {
      // If tenant was updated recently (within last 5 seconds), it might be activating
      // Give it a chance by not caching and redirecting to 404
      const updatedAt = new Date(data.updated_at).getTime()
      const isRecentlyUpdated = Date.now() - updatedAt < 5000

      if (isRecentlyUpdated) {
        // Don't cache inactive tenants that were just updated
        // This handles the onboarding → activation transition
        return NextResponse.redirect(new URL('/404', req.url))
      }

      return NextResponse.redirect(new URL('/404', req.url))
    }

    tenant = data as TenantData

    // Cache with shorter TTL if recently updated (still activating)
    const updatedAt = new Date(data.updated_at).getTime()
    const isRecentlyActivated = Date.now() - updatedAt < 10000
    const cacheTTL = isRecentlyActivated ? 5000 : CACHE_TTL

    tenantCache.set(tenantSlug, { ...tenant, expires: Date.now() + cacheTTL })
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-tenant-id', tenant.id.toString())
  requestHeaders.set('x-tenant-slug', tenant.slug)

  if (pathSegments.includes('dashboard')) {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if user is superadmin
    const isSuperAdmin = user.email &&
      process.env.SUPER_ADMINS?.split(',').map(e => e.trim()).includes(user.email)

    // If not superadmin, check if owner of this tenant
    if (!isSuperAdmin && user.id !== tenant.owner_id) {
      return NextResponse.redirect(new URL(`/${tenantSlug}`, req.url))
    }
  }

  supabaseResponse.headers.set('x-tenant-id', tenant.id.toString())
  supabaseResponse.headers.set('x-tenant-slug', tenant.slug)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
