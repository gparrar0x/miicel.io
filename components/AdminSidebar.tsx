'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Store
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
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: `/${tenant}/dashboard`,
      icon: LayoutDashboard,
      testId: 'nav-dashboard'
    },
    {
      name: 'Products',
      href: `/${tenant}/dashboard/products`,
      icon: Package,
      testId: 'nav-products'
    },
    {
      name: 'Orders',
      href: `/${tenant}/dashboard/orders`,
      icon: ShoppingCart,
      testId: 'nav-orders'
    },
    {
      name: 'Settings',
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {tenantLogo ? (
              <img src={tenantLogo} alt={tenantName || 'Store'} className="h-8 w-8 rounded" />
            ) : (
              <Store className="h-8 w-8 text-blue-600" />
            )}
            <span className="font-semibold text-gray-900">{tenantName || 'Admin Panel'}</span>
          </div>
          <button
            data-testid="btn-toggle-sidebar"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
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
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200 mt-14 lg:mt-0">
          {tenantLogo ? (
            <img src={tenantLogo} alt={tenantName || 'Store'} className="h-10 w-10 rounded" />
          ) : (
            <div className="h-10 w-10 rounded bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <Store className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {tenantName || 'Admin Panel'}
            </p>
            <p className="text-xs text-gray-500 truncate">/{tenant}</p>
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
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  "text-sm font-medium",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-blue-700" : "text-gray-400")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            data-testid="btn-logout"
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
