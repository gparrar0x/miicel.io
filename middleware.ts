import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

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

const intlMiddleware = createMiddleware(routing)

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Skip middleware for static tenant assets so they are served directly from Next.js public folder
  if (pathname.startsWith('/tenants/')) {
    return NextResponse.next()
  }

  const isApi = pathname.startsWith('/api')

  // All routes now use [locale] prefix (unified structure)
  // 1. Run intl middleware first to handle locale redirects/rewrites for ALL routes
  const intlResponse = !isApi ? intlMiddleware(req) : NextResponse.next()

  // If it's a redirect, return immediately
  if (intlResponse.headers.get('Location')) {
    return intlResponse
  }

  // 2. Setup Supabase client
  // We need to pass the request and response to Supabase
  // But we want to preserve any headers set by intlMiddleware (like x-next-intl-locale)
  let supabaseResponse = intlResponse

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
          // Copy headers from intlResponse to new response
          intlResponse.headers.forEach((value, key) => {
            supabaseResponse.headers.set(key, value)
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

  // Structure is now: /[locale]/[tenantId]/... for ALL routes
  // pathSegments[0] = locale (e.g. 'es' or 'en')
  // pathSegments[1] = tenantId OR special routes (login, signup, test-theme)

  // Skip tenant logic for API routes, special pages, and root
  if (!pathSegments[0] || pathSegments[0] === 'api') {
    return supabaseResponse
  }

  // Check if first segment is a locale
  if (!routing.locales.includes(pathSegments[0] as any)) {
    // If not a locale, let it 404 (intl middleware should have redirected)
    return supabaseResponse
  }

  const secondSegment = pathSegments[1]

  // Skip tenant logic for special routes under [locale]
  if (!secondSegment ||
      secondSegment === 'signup' ||
      secondSegment === 'test-theme' ||
      secondSegment === 'login') {
    return supabaseResponse
  }

  const tenantSlug = secondSegment

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
      // If not found, we might want to let it pass (maybe it's a static file or something else)
      // But for now, existing logic redirects to 404
      // We should probably preserve the locale in the 404 redirect?
      // For now, let's just redirect to /404 (which will be handled by intl middleware again? No, we are inside it)
      // Actually, if we redirect to /404, the browser will request /404, and intl middleware will redirect to /es/404
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

  // We need to pass these headers to the response
  supabaseResponse.headers.set('x-tenant-id', tenant.id.toString())
  supabaseResponse.headers.set('x-tenant-slug', tenant.slug)

  // Auth check for dashboard routes
  // If path contains 'dashboard', we need to check auth
  // pathSegments might be ['es', 'tenant', 'dashboard'] or ['tenant', 'dashboard']
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
      // Redirect to tenant root (which will be /es/tenant or /tenant)
      // We should construct the URL carefully
      // req.url includes the full path. We want to replace the path with `/${tenantSlug}` (plus locale)
      // But `NextResponse.redirect` takes a URL.
      // If we redirect to `/${tenantSlug}`, intl middleware will handle it.
      return NextResponse.redirect(new URL(`/${tenantSlug}`, req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
