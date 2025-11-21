"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MenuItemProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    image: string
    badges?: string[]
  }
  onAddToCart: (item: { id: string; name: string; price: number }) => void
}

const badgeStyles: { [key: string]: string } = {
  "Más Vendido": "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  Picante: "bg-red-600 text-white",
  Vegano: "bg-green-600 text-white",
  Nuevo: "bg-blue-600 text-white",
}

export function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    onAddToCart({ id: item.id, name: item.name, price: item.price })

    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-orange-100">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {item.badges && item.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {item.badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold shadow-lg",
                  badgeStyles[badge] || "bg-gray-800 text-white",
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-balance">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 text-pretty">{item.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
          <Button
            onClick={handleAddToCart}
            className={cn(
              "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg transition-all duration-300",
              isAdding && "scale-90",
            )}
          >
            <Plus className={cn("w-5 h-5 mr-1 transition-transform", isAdding && "rotate-90")} />
            Agregar
          </Button>
        </div>
      </div>
    </Card>
  )
}
