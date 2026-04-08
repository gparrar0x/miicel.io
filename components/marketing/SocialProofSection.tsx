'use client'

/**
 * SocialProofSection — Testimonials + logo strip
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Social Proof)
 *
 * data-testid: section-social-proof, card-testimonial-{0,1,2}
 */

const TESTIMONIALS = [
  {
    id: 0,
    name: 'Maria Lopez',
    title: 'Fundadora, Clinica Salud',
    text: 'Redujimos un 50% las llamadas de confirmacion. El agente responde 24/7 y los pacientes reservan solos.',
    avatar: 'ML',
  },
  {
    id: 1,
    name: 'Carlos Mendez',
    title: 'Director, TechStore',
    text: 'En el primer mes cerramos $10k en ventas adicionales a traves del agente de WhatsApp.',
    avatar: 'CM',
  },
  {
    id: 2,
    name: 'Ana Rodriguez',
    title: 'COO, RestauranteBA',
    text: 'Reservas automaticas sin staff extra. El ROI fue inmediato.',
    avatar: 'AR',
  },
]

// Placeholder logo names (grayscale SVG would go here)
const LOGOS = ['TechCorp', 'MediSalud', 'FoodChain', 'DataFlow', 'LogiPro', 'NexGen']

export function SocialProofSection() {
  return (
    <section
      data-testid="section-social-proof"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2
          data-testid="section-header"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 22,
            lineHeight: 1.4,
            color: '#0C1A27',
            margin: '0 0 48px 0',
            textAlign: 'center',
          }}
        >
          De confianza
        </h2>

        {/* Testimonials grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              data-testid={`card-testimonial-${t.id}`}
              style={{
                padding: 24,
                borderRadius: 8,
                border: '1px solid rgba(95, 115, 130, 0.2)',
                backgroundColor: '#FFFFFF',
              }}
            >
              <p
                style={{
                  fontFamily: "'Geist Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#5F7382',
                  margin: '0 0 16px 0',
                  fontStyle: 'italic',
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar placeholder */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#EFEEE9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#0C1A27',
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      lineHeight: 1.4,
                      color: '#0C1A27',
                      margin: 0,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Geist Sans', system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      lineHeight: 1.4,
                      color: '#5F7382',
                      margin: 0,
                    }}
                  >
                    {t.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logo strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 32,
          }}
        >
          {LOGOS.map((logo) => (
            <span
              key={logo}
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: '#5F7382',
                opacity: 0.5,
                letterSpacing: '0.05em',
                transition: 'opacity 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.5'
              }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
