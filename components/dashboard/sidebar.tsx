"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MicelioLogo } from "@/components/icons/micelio-logo"
import { Package, ShoppingCart, Users, Settings, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  name: string
  href: string
  icon: "dashboard" | "products" | "orders" | "users" | "settings" | LucideIcon
}

interface SidebarProps {
  brand?: string
  navItems?: NavItem[]
  collapsedDefault?: boolean
}

const defaultNavigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { name: "Productos", href: "/dashboard/productos", icon: "products" },
  { name: "Pedidos", href: "/dashboard/pedidos", icon: "orders" },
  { name: "Usuarios", href: "/dashboard/usuarios", icon: "users" },
  { name: "Settings", href: "/dashboard/settings", icon: "settings" },
]

export function Sidebar({ brand = "Micelio", navItems = defaultNavigation, collapsedDefault = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(collapsedDefault)

  const iconMap = useMemo(
    () => ({
      dashboard: LayoutDashboard,
      products: Package,
      orders: ShoppingCart,
      users: Users,
      settings: Settings,
    }),
    [],
  )

  const getIcon = (icon: NavItem["icon"]): LucideIcon => {
    if (typeof icon === "string") {
      return iconMap[icon as keyof typeof iconMap] ?? LayoutDashboard
    }
    return icon
  }

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href={navItems[0]?.href ?? "/dashboard"} className="flex items-center gap-3">
          <MicelioLogo className="h-8 w-8 text-sidebar-foreground" />
          {!collapsed && <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">{brand}</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = getIcon(item.icon)
          return (
            <Link
              key={item.name}
              href={item.href}
              data-testid={`nav-${typeof item.icon === 'string' ? item.icon : 'custom'}`}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-sidebar-border p-3">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center" data-testid="btn-toggle-sidebar">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  )
}
