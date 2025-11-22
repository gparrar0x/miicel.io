type HoursRecord = Record<string, { open: string; close: string }>

interface RestaurantHeaderProps {
  tenantName: string
  tenantLogo?: string | null
  tenantLogoText?: string | null
  tenantBanner?: string | null
  tenantSubtitle?: string
  tenantLocation?: string
  hours?: HoursRecord
}

export function RestaurantHeader({
  tenantName,
  tenantLogo,
  tenantLogoText,
  tenantBanner,
  tenantSubtitle,
  tenantLocation,
  hours,
}: RestaurantHeaderProps) {
  const now = new Date()
  const dayIndex = now.getDay() // 0 = Sunday
  const dayKeys: Array<keyof HoursRecord> = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const dayLabels = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  const dayKey = dayKeys[dayIndex]
  const todayLabel = dayLabels[dayIndex]
  const todayHours = hours?.[dayKey]
  const currentTime = now.toTimeString().slice(0, 5) // HH:MM

  let todayLine: string | null = null
  if (todayHours && todayHours.open && todayHours.close) {
    todayLine = `Hoy ${todayLabel}: ${todayHours.open}-${todayHours.close}`
  } else if (hours) {
    todayLine = `Hoy ${todayLabel}: Cerrado`
  }

  const heroSubtitle = tenantSubtitle || 'Deliciosa comida Venezolana'

  return (
    <header className="relative h-64 md:h-80 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: tenantBanner 
            ? `url(${tenantBanner})` 
            : `linear-gradient(135deg, 
                color-mix(in srgb, var(--color-primary) 90%, black), 
                color-mix(in srgb, var(--color-primary) 70%, black), 
                color-mix(in srgb, var(--color-primary) 80%, black))`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8">
        <div className="inline-flex flex-col gap-3 bg-black/55 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xl">
          <div className="flex items-end gap-4">
          {tenantLogo && (
            <img
              src={tenantLogo}
              alt={tenantName}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          )}
          <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white text-balance drop-shadow-md">
                {tenantName}
              </h1>
            </div>
          </div>

          <div className="text-white space-y-1">
            <p className="text-lg md:text-xl opacity-95 drop-shadow-md">
              {heroSubtitle}
            </p>
            {tenantLocation && (
              <div className="flex items-center gap-2 text-sm md:text-base opacity-95 drop-shadow-md">
                <span>📍</span>
                <span>{tenantLocation}</span>
              </div>
            )}
            {todayLine && (
              <div className="flex items-center gap-2 text-sm md:text-base opacity-95 drop-shadow-md">
                <span>🕒</span>
                <span>
                  {todayLine}{' '}
                  <span className="text-xs opacity-80 ml-1">({currentTime})</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

