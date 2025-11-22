"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/stores/cartStore"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
}

export function CartSheet({ open, onOpenChange, tenantId }: CartSheetProps) {
  const { items, removeItem, getTotalPrice } = useCartStore()
  
  const totalPrice = getTotalPrice()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 bg-white border-l border-gray-200">
        <SheetHeader className="border-b border-gray-200" style={{ padding: 'var(--spacing-md) var(--spacing-md)' }}>
          <SheetTitle className="font-serif font-bold text-black" style={{ fontSize: 'var(--font-size-h2)' }}>
            Carrito de Compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: 'var(--spacing-xl) var(--spacing-md)' }}>
            <ShoppingBagIcon className="h-16 w-16 mb-6 opacity-20 text-gray-400" />
            <p className="font-medium text-gray-600 mb-2" style={{ fontSize: 'var(--font-size-h4)' }}>
              Tu carrito está vacío
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Agrega obras de arte para comenzar
            </p>
            <Button 
              variant="outline" 
              className="bg-transparent border-2 border-black text-black rounded-full hover:bg-black hover:text-white transition-colors"
              style={{ padding: '12px 24px', fontSize: 'var(--font-size-small)' }}
              onClick={() => onOpenChange(false)}
            >
              Continuar Explorando
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1" style={{ padding: '0 var(--spacing-md)' }}>
              <div className="flex flex-col" style={{ gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 0' }}>
                {items.map((item) => (
                  <div key={`${item.productId}-${item.name}`} className="flex pb-4 border-b border-gray-200" style={{ gap: 'var(--spacing-sm)' }}>
                    <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-2 text-black" style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height-normal)' }}>
                            {item.name}
                          </h3>
                          {item.size && (
                            <p className="text-gray-600 mt-1" style={{ fontSize: 'var(--font-size-small)' }}>
                              {item.size.label} — {item.size.dimensions}
                            </p>
                          )}
                          <p className="text-gray-500 mt-1" style={{ fontSize: 'var(--font-size-tiny)' }}>
                            Edición única
                          </p>
                        </div>
                        <button
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
                          onClick={() => removeItem(item.productId, item.color?.id)}
                          aria-label="Eliminar del carrito"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="font-bold text-black mt-2" style={{ fontSize: 'var(--font-size-h4)' }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency }).format(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-gray-200 bg-white" style={{ padding: 'var(--spacing-md)' }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600" style={{ fontSize: 'var(--font-size-body)' }}>
                  Total
                </span>
                <span className="font-serif font-bold text-black" style={{ fontSize: 'var(--font-size-h1)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: items[0]?.currency || 'USD' }).format(totalPrice)}
                </span>
              </div>
              <p className="text-gray-500 text-center mb-6" style={{ fontSize: 'var(--font-size-tiny)' }}>
                {items.length} {items.length === 1 ? 'obra seleccionada' : 'obras seleccionadas'}
              </p>
              <Link href={`/${tenantId}/cart`}>
                <Button 
                  className="w-full rounded-full text-white font-medium transition-all hover:opacity-90 shadow-sm"
                  style={{ 
                    backgroundColor: 'var(--color-accent-primary)',
                    height: '56px',
                    fontSize: 'var(--font-size-h4)'
                  }}
                  onClick={() => onOpenChange(false)}
                >
                  Ir a Pagar
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

