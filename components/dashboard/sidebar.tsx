"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MicelioLogo } from "@/components/icons/micelio-logo"
import { Package, ShoppingCart, Users, Settings, LayoutDashboard, ChevronLeft, ChevronRight, ExternalLink, MapPin, BarChart3 } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useSidebar } from "./sidebar-context"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { LucideIcon } from "lucide-react"

export type NavItem = {
  name: string
  href: string
  icon: "dashboard" | "products" | "orders" | "users" | "settings" | "consignments" | "analytics" | LucideIcon
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
  const { isOpen, setIsOpen } = useSidebar()

  const iconMap = useMemo(
    () => ({
      dashboard: LayoutDashboard,
      products: Package,
      orders: ShoppingCart,
      users: Users,
      settings: Settings,
      consignments: MapPin,
      analytics: BarChart3,
    }),
    [],
  )

  const getIcon = (icon: NavItem["icon"]): LucideIcon => {
    if (typeof icon === "string") {
      return iconMap[icon as keyof typeof iconMap] ?? LayoutDashboard
    }
    return icon
  }

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link
          href={navItems[0]?.href ?? "/dashboard"}
          className="flex items-center gap-3"
          onClick={() => mobile && setIsOpen(false)}
        >
          <MicelioLogo className="h-8 w-8 text-sidebar-foreground" />
          {(mobile || !collapsed) && <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">{brand}</span>}
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
              onClick={() => mobile && setIsOpen(false)}
              data-testid={`nav-${typeof item.icon === 'string' ? item.icon : 'custom'}`}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(mobile || !collapsed) && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* View Store button */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href={pathname.replace(/\/dashboard.*$/, '')}
          target="_blank"
          onClick={() => mobile && setIsOpen(false)}
          data-testid="nav-view-store"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {(mobile || !collapsed) && <span>Ver Tienda</span>}
        </Link>
      </div>

      {/* Collapse button - only on desktop */}
      {!mobile && (
        <div className="border-t border-sidebar-border p-3">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-center" data-testid="btn-toggle-sidebar">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        data-testid="sidebar"
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-background border-r">
          <VisuallyHidden>
            <SheetTitle>Navigation menu</SheetTitle>
          </VisuallyHidden>
          <div className="flex h-full flex-col bg-sidebar">
            <NavContent mobile />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
