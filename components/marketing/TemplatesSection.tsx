'use client'

/**
 * TemplatesSection — 4 template cards: Reservas, Ventas, Soporte, Custom
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Templates)
 *
 * data-testid: section-templates, card-template-{id}
 */

const TEMPLATES = [
  {
    id: 'reservas',
    title: 'Agente de Reservas',
    description:
      'Clinicas, restaurantes, consultorios. Agenda automatica con confirmaciones por WhatsApp.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="6" y="4" width="20" height="24" rx="2" stroke="#D4AF37" strokeWidth="1.5" />
        <path d="M11 4V8M21 4V8M6 12h20" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="20" r="2" fill="#D4AF37" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'ventas',
    title: 'Agente de Ventas',
    description: 'E-commerce y catalogo. Responde consultas, envia precios, cierra ventas.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M8 8h2l3 12h10l3-8H12"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="14" cy="24" r="2" fill="#D4AF37" opacity="0.4" />
        <circle cx="22" cy="24" r="2" fill="#D4AF37" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'soporte',
    title: 'Agente de Soporte',
    description: 'Help desk inteligente. Resuelve tickets, escala a humanos, aprende.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="10" stroke="#D4AF37" strokeWidth="1.5" />
        <path
          d="M16 12v5l3 3"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'custom',
    title: 'Agente Custom',
    description: 'Lienzo en blanco. Define tus propios flujos, integraciones y logica.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect
          x="6"
          y="6"
          width="20"
          height="20"
          rx="2"
          stroke="#D4AF37"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <path d="M16 12v8M12 16h8" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function TemplatesSection() {
  return (
    <section
      data-testid="section-templates"
      style={{
        backgroundColor: '#FFFFFF',
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
          Templates listos para usar
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {TEMPLATES.map((template, i) => (
            <div
              key={template.id}
              data-testid={`card-template-${template.id}`}
              className={`micelio-fade-in micelio-stagger-${i + 1}`}
              style={{
                padding: 24,
                borderRadius: 8,
                backgroundColor: '#EFEEE9',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'box-shadow 150ms ease-out, transform 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              }}
            >
              <div style={{ marginBottom: 16 }}>{template.icon}</div>

              <h3
                data-testid="card-headline"
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: '#0C1A27',
                  margin: '0 0 8px 0',
                }}
              >
                {template.title}
              </h3>

              <p
                data-testid="card-body"
                style={{
                  fontFamily: "'Geist Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: '#5F7382',
                  margin: 0,
                }}
              >
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
