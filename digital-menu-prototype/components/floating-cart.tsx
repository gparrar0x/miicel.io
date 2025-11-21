"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingCartProps {
  totalItems: number
  totalPrice: number
  onClick: () => void
}

export function FloatingCart({ totalItems, totalPrice, onClick }: FloatingCartProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto px-4 pb-4">
        <Button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.02]"
          size="lg"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="text-lg">Ver Pedido</span>
            </div>
            <span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
