import { MapPin, Clock } from "lucide-react"

export function RestaurantHeader() {
  return (
    <header className="relative h-64 md:h-80 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-orange-700"
        style={{
          backgroundImage:
            "url(/placeholder.svg?height=400&width=1200&query=elegant+restaurant+interior+warm+lighting)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8">
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">La Casa del Sabor</h1>
          <div className="flex flex-col sm:flex-row gap-4 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-300" />
              <span className="text-orange-50">Av. Principal 123, Centro</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-300" />
              <span className="text-orange-50">Abierto: 11:00 AM - 11:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
