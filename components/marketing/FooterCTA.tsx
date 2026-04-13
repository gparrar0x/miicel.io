'use client'

/**
 * FooterCTA — Final CTA + cross-product link to Espora
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §2 (Footer CTA) + §4 (Footer)
 *
 * data-testid: footer, footer-cta, footer-cross-product-link
 */

export function FooterCTA() {
  return (
    <footer
      data-testid="footer"
      style={{
        backgroundColor: '#EFEEE9',
        padding: '64px 24px 32px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* CTA block */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 64,
          }}
        >
          <h2
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 36,
              lineHeight: 1.2,
              color: '#0C1A27',
              margin: '0 0 16px 0',
            }}
          >
            Listo para comenzar?
          </h2>

          <p
            style={{
              fontFamily: "'Geist Sans', system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: 1.5,
              color: '#5F7382',
              margin: '0 0 32px 0',
            }}
          >
            Crea tu primer agente hoy mismo. Sin tarjeta de credito.
          </p>

          <a
            href="#"
            data-testid="footer-cta"
            style={{
              display: 'inline-block',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 500,
              fontSize: 16,
              color: '#FFFFFF',
              backgroundColor: 'var(--micelio-cta)',
              padding: '16px 32px',
              borderRadius: 6,
              textDecoration: 'none',
              transition: 'background-color 150ms ease-out, box-shadow 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--micelio-cta-hover)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--micelio-cta)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Empieza gratis
          </a>

          <p style={{ marginTop: 24 }}>
            <a
              href="https://espora.skyw.app"
              data-testid="footer-cross-product-link"
              style={{
                fontFamily: "'Geist Sans', system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.5,
                color: '#D4AF37',
                textDecoration: 'none',
                transition: 'opacity 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Quieres que lo hagamos por ti? &rarr; Espora
            </a>
          </p>
        </div>

        {/* Footer bottom */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32,
            borderTop: '1px solid rgba(95, 115, 130, 0.2)',
            paddingTop: 32,
          }}
        >
          {/* Brand */}
          <div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 16,
                color: '#0C1A27',
                margin: '0 0 8px 0',
              }}
            >
              Skywalking
            </p>
            <p
              style={{
                fontFamily: "'Geist Sans', system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.5,
                color: '#5F7382',
                margin: 0,
              }}
            >
              Desarrollado con IA. Disenado por humanos.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: '#0C1A27',
                margin: '0 0 12px 0',
              }}
            >
              Producto
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Templates', 'Precios', 'Documentacion'].map((link) => (
                <li key={link} style={{ padding: '4px 0' }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "'Geist Sans', system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      color: '#5F7382',
                      textDecoration: 'none',
                      transition: 'color 150ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#0C1A27'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#5F7382'
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
                fontSize: 14,
                color: '#0C1A27',
                margin: '0 0 12px 0',
              }}
            >
              Legal
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {['Privacidad', 'Terminos', 'Contacto'].map((link) => (
                <li key={link} style={{ padding: '4px 0' }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "'Geist Sans', system-ui, sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      color: '#5F7382',
                      textDecoration: 'none',
                      transition: 'color 150ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#0C1A27'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#5F7382'
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <p
          style={{
            fontFamily: "'Geist Sans', system-ui, sans-serif",
            fontWeight: 400,
            fontSize: 12,
            color: '#5F7382',
            textAlign: 'center',
            marginTop: 32,
            opacity: 0.6,
          }}
        >
          &copy; 2026 Skywalking.dev
        </p>
      </div>
    </footer>
  )
}
