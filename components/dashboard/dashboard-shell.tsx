'use client'

import { Header } from './header'
import { type NavItem, Sidebar } from './sidebar'
import { SidebarProvider } from './sidebar-context'

interface DashboardShellProps {
  children: React.ReactNode
  navItems: NavItem[]
}

export function DashboardShell({ children, navItems }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar brand="Miicel" navItems={navItems} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
