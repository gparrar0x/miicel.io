/**
 * NavHeader — Sticky marketing navigation
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §4 (Shared)
 *
 * data-testid: nav-header, nav-logo, nav-cta
 */

'use client'

import { useEffect, useState } from 'react'
import { MicelioLogo } from '@/components/icons/micelio-logo'

export function NavHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      data-testid="nav-header"
      className="fixed top-0 right-0 left-0 z-50 transition-colors"
      style={{
        height: 64,
        backgroundColor: scrolled ? 'rgba(239, 238, 233, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        transitionDuration: '200ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div
        className="mx-auto flex h-full items-center justify-between"
        style={{ maxWidth: 1200, paddingLeft: 24, paddingRight: 24 }}
      >
        <a
          href="#"
          data-testid="nav-logo"
          className="flex items-center gap-8"
          style={{ textDecoration: 'none' }}
        >
          <MicelioLogo className="h-8 w-8" style={{ color: '#0C1A27' }} />
          <span
            style={{
              fontFamily: "var(--micelio-font-heading, 'Plus Jakarta Sans', system-ui)",
              fontWeight: 600,
              fontSize: 16,
              color: '#0C1A27',
            }}
          >
            Micelio
          </span>
        </a>
        <a
          href="#pricing"
          data-testid="nav-cta"
          style={{
            fontFamily: "var(--micelio-font-heading, 'Plus Jakarta Sans', system-ui)",
            fontWeight: 500,
            fontSize: 12,
            color: '#FFFFFF',
            backgroundColor: '#D97706',
            padding: '12px 24px',
            borderRadius: 6,
            textDecoration: 'none',
            transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#C86206'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#D97706'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Empieza gratis
        </a>
      </div>
    </nav>
  )
}
