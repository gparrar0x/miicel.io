'use client'

/**
 * HeroSection — 85vh hero with headline, subheadline, CTA, and Glitch overlay
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Hero)
 *
 * data-testid: hero-section, hero-headline, hero-subheadline, hero-cta
 */

import { Glitch } from './Glitch'

export function HeroSection() {
  return (
    <section
      data-testid="hero-section"
      style={{
        position: 'relative',
        minHeight: '85vh',
        backgroundColor: '#EFEEE9',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <Glitch variant="micelio" />

      <div
        className="micelio-fade-in"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '96px 24px 64px',
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h1
            data-testid="hero-headline"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 48,
              lineHeight: 1.1,
              color: '#0C1A27',
              margin: '0 0 24px 0',
            }}
          >
            Tu agente de WhatsApp, listo en minutos.
          </h1>

          <p
            data-testid="hero-subheadline"
            style={{
              fontFamily: "'Geist Sans', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: 1.5,
              color: '#5F7382',
              margin: '0 0 32px 0',
              maxWidth: 480,
            }}
          >
            Configura, conecta y automatiza sin codigo. Para negocios en LATAM.
          </p>

          <a
            href="#pricing"
            data-testid="hero-cta"
            style={{
              display: 'inline-block',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              color: '#FFFFFF',
              backgroundColor: '#D97706',
              padding: '16px 32px',
              borderRadius: 6,
              textDecoration: 'none',
              transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              ;(e.target as HTMLElement).style.backgroundColor = '#C86206'
              ;(e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              ;(e.target as HTMLElement).style.backgroundColor = '#D97706'
              ;(e.target as HTMLElement).style.boxShadow = 'none'
            }}
          >
            Empieza gratis
          </a>
        </div>
      </div>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 767px) {
          [data-testid="hero-headline"] {
            font-size: 36px !important;
          }
        }
        @media (min-width: 768px) {
          [data-testid="hero-section"] > div:nth-child(2) {
            padding-left: 48px !important;
            padding-right: 48px !important;
          }
        }
      `}</style>
    </section>
  )
}
