'use client'

import { useState, useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  tenant: string
  tenantName?: string
  tenantLogo?: string
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  testId: string
}

export function AdminSidebar({ tenant, tenantName, tenantLogo }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('Sidebar')

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        const emailName = user.email?.split('@')[0] || t('user')
        setUserName(user.user_metadata?.name || emailName)
      }
    }
    fetchUser()
  }, [t])

  const navItems: NavItem[] = [
    {
      name: t('dashboard'),
      href: `/${tenant}/dashboard`,
      icon: LayoutDashboard,
      testId: 'nav-dashboard'
    },
    {
      name: t('products'),
      href: `/${tenant}/dashboard/products`,
      icon: Package,
      testId: 'nav-products'
    },
    {
      name: t('orders'),
      href: `/${tenant}/dashboard/orders`,
      icon: ShoppingCart,
      testId: 'nav-orders'
    },
    {
      name: t('settings'),
      href: `/${tenant}/dashboard/settings`,
      icon: Settings,
      testId: 'nav-settings'
    }
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push(`/${tenant}`)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-mii-white border-b border-mii-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <img src={tenantLogo} alt={tenantName || t('adminPanel')} className="h-8 w-8 rounded-mii object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-mii bg-mii-black flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-mii-h3 text-mii-black">{tenantName || t('adminPanel')}</span>
          </div>
          <button
            data-testid="btn-toggle-sidebar"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-mii-sm hover:bg-mii-gray-50 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-mii-gray-500" />
            ) : (
              <Menu className="h-6 w-6 text-mii-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Black Background */}
      <aside
        data-testid="admin-sidebar"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-mii-sidebar bg-mii-black transition-transform duration-300 flex flex-col",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10 mt-14 lg:mt-0">
          {tenantLogo ? (
            <img src={tenantLogo} alt={tenantName || t('adminPanel')} className="h-10 w-10 rounded-mii object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-mii bg-mii-blue flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {tenantName || t('adminPanel')}
            </p>
            <p className="text-xs text-white/50 truncate">/{tenant}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-xs font-medium text-white/40 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== `/${tenant}/dashboard` && pathname.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                onClick={closeMobileMenu}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-mii-sm transition-all duration-200",
                  "text-sm font-medium",
                  isActive
                    ? "bg-mii-blue text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* View Store Link */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href={`/${tenant}`}
              data-testid="nav-view-store"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-mii-sm transition-all duration-200 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Store className="h-5 w-5" />
              <span>{t('viewStore')}</span>
            </Link>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-white/10 p-3">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-white/50 truncate">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            data-testid="btn-logout"
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-mii-sm text-sm font-medium text-white/70 hover:bg-mii-error/20 hover:text-mii-error transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
