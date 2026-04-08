/**
 * Micelio Marketing Landing Page
 * Route: /[locale]/landing
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2
 *
 * This is the public marketing entry point for micelio.skyw.app.
 * Separate from [locale]/page.tsx (admin/login) to avoid routing conflicts
 * with [locale]/[tenantId] dynamic segments.
 */

import type { Metadata } from 'next'
import {
  NavHeader,
  HeroSection,
  ProblemSection,
  HowItWorksSection,
  TemplatesSection,
  PricingSection,
  SocialProofSection,
  FooterCTA,
} from '@/components/marketing'

export const metadata: Metadata = {
  title: 'Micelio — Tu agente de WhatsApp, listo en minutos',
  description:
    'Configura, conecta y automatiza agentes de WhatsApp sin codigo. Para negocios en LATAM.',
  openGraph: {
    title: 'Micelio — Agentes de WhatsApp para tu negocio',
    description:
      'Automatiza atencion, reservas y ventas por WhatsApp. Sin codigo, listo en minutos.',
    url: 'https://micelio.skyw.app',
    siteName: 'Micelio',
    type: 'website',
  },
}

export default function LandingPage() {
  return (
    <>
      {/* Marketing CSS tokens */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
      />

      <div className="micelio-marketing">
        <NavHeader />

        <main>
          <HeroSection />
          <ProblemSection />
          <HowItWorksSection />
          <TemplatesSection />
          <PricingSection />
          <SocialProofSection />
        </main>

        <FooterCTA />
      </div>
    </>
  )
}
