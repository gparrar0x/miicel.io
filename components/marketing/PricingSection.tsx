'use client'

/**
 * PricingSection — 3 tiers: Starter, Pro (highlighted), Enterprise
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Pricing)
 *
 * data-testid: section-pricing, card-pricing-{id}, card-cta
 */

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    subtitle: 'Perfecto para probar',
    price: '$0',
    period: 'gratis',
    features: ['1 agente', '100 mensajes/dia', 'Soporte email'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    subtitle: 'Para crecer',
    price: '$99',
    period: '/mes',
    features: ['5 agentes', '10,000 mensajes/dia', 'Soporte prioritario', 'Templates premium'],
    highlighted: true,
    badge: 'Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Escala ilimitada',
    price: 'Custom',
    period: '',
    features: ['Agentes ilimitados', 'Integraciones custom', 'SLA dedicado', 'Soporte 24/7'],
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section
      id="pricing"
      data-testid="section-pricing"
      style={{
        backgroundColor: '#EFEEE9',
        padding: '64px 24px',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h2
          data-testid="section-header"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.3,
            color: '#0C1A27',
            margin: '0 0 48px 0',
            textAlign: 'center',
          }}
        >
          Planes flexibles
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              data-testid={`card-pricing-${plan.id}`}
              style={{
                position: 'relative',
                padding: 24,
                borderRadius: 8,
                backgroundColor: '#FFFFFF',
                boxShadow: plan.highlighted
                  ? '0 4px 12px rgba(0,0,0,0.12)'
                  : '0 1px 3px rgba(0,0,0,0.08)',
                border: plan.highlighted ? 'none' : '1px solid rgba(95, 115, 130, 0.2)',
                overflow: 'hidden',
              }}
            >
              {/* Gold accent bar for highlighted plan */}
              {plan.highlighted && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: '#D4AF37',
                  }}
                />
              )}

              {/* Badge */}
              {plan.badge && (
                <span
                  style={{
                    display: 'inline-block',
                    fontFamily: "'Geist Sans', system-ui, sans-serif",
                    fontWeight: 500,
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    padding: '4px 8px',
                    borderRadius: 50,
                    marginBottom: 16,
                  }}
                >
                  {plan.badge}
                </span>
              )}

              <h3
                data-testid="card-headline"
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: '#0C1A27',
                  margin: plan.badge ? '0 0 4px 0' : '0 0 4px 0',
                }}
              >
                {plan.name}
              </h3>

              <p
                style={{
                  fontFamily: "'Geist Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#5F7382',
                  margin: '0 0 24px 0',
                }}
              >
                {plan.subtitle}
              </p>

              <div style={{ margin: '0 0 24px 0' }}>
                <span
                  style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: 36,
                    lineHeight: 1.2,
                    color: '#0C1A27',
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    style={{
                      fontFamily: "'Geist Sans', system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      color: '#5F7382',
                      marginLeft: 4,
                    }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 24px 0',
                }}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      fontFamily: "'Geist Sans', system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: '#5F7382',
                      padding: '6px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M4 8l3 3 5-5"
                        stroke="#10b981"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                data-testid="card-cta"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  color: plan.highlighted ? '#FFFFFF' : '#0C1A27',
                  backgroundColor: plan.highlighted ? 'var(--micelio-cta)' : 'transparent',
                  border: plan.highlighted ? 'none' : '1px solid rgba(95, 115, 130, 0.3)',
                  padding: '12px 24px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  if (plan.highlighted) {
                    e.currentTarget.style.backgroundColor = 'var(--micelio-cta-hover)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                  } else {
                    e.currentTarget.style.backgroundColor = '#EFEEE9'
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.highlighted) {
                    e.currentTarget.style.backgroundColor = 'var(--micelio-cta)'
                    e.currentTarget.style.boxShadow = 'none'
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                Selecciona plan
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
