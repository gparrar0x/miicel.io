"use client"

import { Bell, Search, Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { useSidebar } from "./sidebar-context"

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { toggle } = useSidebar()

  // Initialize theme from localStorage or OS preference
  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") {
      setIsDark(true)
    } else if (stored === "light") {
      setIsDark(false)
    } else {
      // Check OS preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(prefersDark)
    }
    setMounted(true)
  }, [])

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      root.classList.remove("light")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      root.classList.add("light")
      localStorage.setItem("theme", "light")
    }
  }, [isDark, mounted])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      {/* Mobile menu button + Search */}
      <div className="flex items-center gap-3 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-muted-foreground"
          onClick={toggle}
          data-testid="btn-mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar productos, pedidos, usuarios..." className="pl-10 bg-secondary border-0" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Search button for mobile */}
        <Button variant="ghost" size="icon" className="sm:hidden text-muted-foreground">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="text-muted-foreground">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-foreground" />
        </Button>

        {mounted ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/diverse-avatars.png" alt="Usuario" />
                  <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  )
}
