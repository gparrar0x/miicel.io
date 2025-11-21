import { MapPin } from "lucide-react"

interface RestaurantHeaderProps {
  tenantName: string
  tenantLogo?: string | null
  tenantLogoText?: string | null
  tenantBanner?: string | null
  tenantSubtitle?: string
  tenantLocation?: string
}

export function RestaurantHeader({
  tenantName,
  tenantLogo,
  tenantLogoText,
  tenantBanner,
  tenantSubtitle,
  tenantLocation,
}: RestaurantHeaderProps) {
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
        <div className="flex items-end gap-4 mb-4">
          {tenantLogo && (
            <img
              src={tenantLogo}
              alt={tenantName}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          )}
          <div className="flex-1">
            {tenantLogoText ? (
              <img
                src={tenantLogoText}
                alt={tenantName}
                className="h-12 md:h-16 w-auto object-contain"
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">
                {tenantName}
              </h1>
            )}
          </div>
        </div>
        
        <div className="text-white space-y-2">
          {tenantSubtitle && (
            <p className="text-lg md:text-xl opacity-90">{tenantSubtitle}</p>
          )}
          {tenantLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 opacity-80" />
              <span className="opacity-90">{tenantLocation}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

