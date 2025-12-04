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
        // Extract name from email (before @) as fallback
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
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-clean-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <img src={tenantLogo} alt={tenantName || t('adminPanel')} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <Store className="h-6 w-6 text-clean-black" />
            )}
            <span className="font-semibold text-clean-black">{tenantName || t('adminPanel')}</span>
          </div>
          <button
            data-testid="btn-toggle-sidebar"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-clean-gray" />
            ) : (
              <Menu className="h-6 w-6 text-clean-gray" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="admin-sidebar"
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-clean-border transition-transform duration-300",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-clean-border mt-14 lg:mt-0">
          {tenantLogo ? (
            <img src={tenantLogo} alt={tenantName || t('adminPanel')} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-clean-black flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-clean-black truncate">
              {tenantName || t('adminPanel')}
            </p>
            <p className="text-xs text-clean-gray truncate">/{tenant}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "text-sm font-medium",
                  isActive
                    ? "bg-gray-100 text-clean-black"
                    : "text-clean-gray hover:bg-gray-50 hover:text-clean-black"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-clean-black" : "text-clean-gray")} />
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* View Store Link */}
          <div className="pt-4 mt-4 border-t border-clean-border">
            <Link
              href={`/${tenant}`}
              data-testid="nav-view-store"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium text-clean-gray hover:bg-gray-50 hover:text-clean-black"
            >
              <Store className="h-5 w-5 text-clean-gray" />
              <span>{t('viewStore')}</span>
            </Link>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-clean-border p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-clean-gray" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-clean-black truncate">
                {userName}
              </p>
              <p className="text-xs text-clean-gray truncate">
                {userEmail}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            data-testid="btn-logout"
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-clean-gray hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
