import { Clock, Instagram, MapPin, Phone } from 'lucide-react'

interface GastronomyFooterProps {
  tenantName: string
  tenantLocation?: string
  tenantPhone?: string
  tenantInstagram?: string
  businessHours?: Array<{
    day: string
    hours: string
    isToday?: boolean
  }>
}

export function GastronomyFooter({
  tenantName,
  tenantLocation,
  tenantPhone,
  tenantInstagram,
  businessHours = [
    { day: 'Lunes', hours: '20:00-00:30' },
    { day: 'Martes', hours: '20:00-00:30' },
    { day: 'Miércoles', hours: '20:00-00:30' },
    { day: 'Jueves', hours: '20:00-00:30' },
    { day: 'Viernes', hours: '20:00-01:30', isToday: true },
    { day: 'Sábado', hours: '11:00-00:30' },
    { day: 'Domingo', hours: '11:00-00:30' },
  ],
}: GastronomyFooterProps) {
  return (
    <footer
      className="text-white py-8 px-4 mt-8"
      style={{
        background: `linear-gradient(135deg, 
        color-mix(in srgb, var(--color-primary) 90%, black), 
        color-mix(in srgb, var(--color-primary) 70%, black), 
        color-mix(in srgb, var(--color-primary) 80%, black))`,
      }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Horarios de Atención */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 opacity-80" />
              <h3 className="text-xl font-bold">Horarios de Atención</h3>
            </div>
            <div className="space-y-2">
              {businessHours.map((schedule) => (
                <div
                  key={schedule.day}
                  className="flex justify-between items-center px-3 py-2 rounded-lg transition-all text-sm"
                  style={{
                    background: schedule.isToday
                      ? 'rgba(255, 255, 255, 0.25)'
                      : 'rgba(255, 255, 255, 0.1)',
                    ...(schedule.isToday && {
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                    }),
                  }}
                >
                  <span className="font-semibold">{schedule.day}</span>
                  <span className="opacity-90">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-5 h-5 opacity-80" />
              <h3 className="text-xl font-bold">Contacto</h3>
            </div>
            <div className="space-y-3">
              {tenantLocation && (
                <div className="flex items-start gap-3 bg-white/10 px-3 py-2 rounded-lg text-sm">
                  <MapPin className="w-4 h-4 opacity-80 flex-shrink-0 mt-0.5" />
                  <span className="opacity-90">{tenantLocation}</span>
                </div>
              )}
              {tenantPhone && (
                <a
                  href={`https://wa.me/${tenantPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 opacity-80 flex-shrink-0" />
                  <div>
                    <div className="text-xs opacity-75">WhatsApp:</div>
                    <div className="opacity-90 font-semibold">{tenantPhone}</div>
                  </div>
                </a>
              )}
              {tenantInstagram && (
                <a
                  href={`https://instagram.com/${tenantInstagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Instagram className="w-4 h-4 opacity-80 flex-shrink-0" />
                  <span className="opacity-90 font-semibold">{tenantInstagram}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center opacity-80 text-xs">
          <p>
            © {new Date().getFullYear()} {tenantName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
