/**
 * ProblemSection — 3 stat cards showing current pain points
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Problem)
 *
 * data-testid: section-problem, card-stat-{0,1,2}
 */

const STATS = [
  {
    id: 'stat-0',
    number: '45%',
    text: 'de empresas pierden leads por lentitud en respuesta',
  },
  {
    id: 'stat-1',
    number: '30 min',
    text: 'promedio para setup de chatbot tradicional',
  },
  {
    id: 'stat-2',
    number: '$500/mes',
    text: 'en herramientas de automatizacion',
  },
]

export function ProblemSection() {
  return (
    <section
      data-testid="section-problem"
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
          El problema actual
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.id}
              data-testid={`card-${stat.id}`}
              className={`micelio-fade-in micelio-stagger-${i + 1}`}
              style={{
                padding: 24,
                borderRadius: 8,
                border: '1px solid rgba(95, 115, 130, 0.2)',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <p
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: 36,
                  lineHeight: 1.2,
                  color: '#D4AF37',
                  margin: '0 0 8px 0',
                }}
              >
                {stat.number}
              </p>
              <p
                style={{
                  fontFamily: "'Geist Sans', system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: '#5F7382',
                  margin: 0,
                }}
              >
                {stat.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
