/**
 * HowItWorksSection — 3-step process: Conecta, Configura, Automatiza
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Como Funciona)
 *
 * data-testid: section-how-it-works, card-step-{0,1,2}
 */

const STEPS = [
  {
    id: 'step-0',
    number: '01',
    title: 'Conecta',
    description: 'Vincula tu numero de WhatsApp en 30 segundos.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke="#D4AF37" strokeWidth="1.5" opacity="0.3" />
        <path
          d="M16 24h16M28 20l4 4-4 4"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'step-1',
    number: '02',
    title: 'Configura',
    description: 'Define intenciones, respuestas y flujos sin codigo.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke="#D4AF37" strokeWidth="1.5" opacity="0.3" />
        <path d="M18 18h12v12H18z" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 24h4M24 22v4" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'step-2',
    number: '03',
    title: 'Automatiza',
    description: 'Tu agente responde, toma decisiones, escala.',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <circle cx="24" cy="24" r="20" stroke="#D4AF37" strokeWidth="1.5" opacity="0.3" />
        <path
          d="M20 28l4-8 4 8M18 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section
      data-testid="section-how-it-works"
      style={{
        backgroundColor: '#EFEEE9',
        padding: '64px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h2
          data-testid="section-header"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.3,
            color: '#0C1A27',
            margin: '0 0 48px 0',
          }}
        >
          Como funciona
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 32,
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              data-testid={`card-${step.id}`}
              className={`micelio-fade-in micelio-stagger-${i + 1}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ marginBottom: 8 }}>{step.icon}</div>

              <div
                style={{
                  fontFamily: "'Geist Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: '#D4AF37',
                  letterSpacing: '0.05em',
                }}
              >
                {step.number}
              </div>

              <h3
                data-testid="card-headline"
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: '#0C1A27',
                  margin: 0,
                }}
              >
                {step.title}
              </h3>

              <p
                data-testid="card-body"
                style={{
                  fontFamily: "'Geist Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: '#5F7382',
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          [data-testid="section-how-it-works"] > div {
            padding-left: 24px;
            padding-right: 24px;
          }
        }
      `}</style>
    </section>
  )
}
