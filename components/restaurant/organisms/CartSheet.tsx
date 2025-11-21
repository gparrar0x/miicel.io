'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CartItem } from '@/types/commerce'

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  totalPrice: number
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  currency?: string
}

export function CartSheet({
  open,
  onOpenChange,
  items,
  totalPrice,
  onUpdateQuantity,
  onRemoveItem,
  currency = 'CLP',
}: CartSheetProps) {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    notes: '',
  })
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
  })

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency,
    }).format(price)
  }

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return !newErrors.fullName && !newErrors.email
  }

  const handleConfirmOrder = () => {
    setCheckoutStep('checkout')
  }

  const handleBackToCart = () => {
    setCheckoutStep('cart')
  }

  const handleProceedToPayment = () => {
    if (validateForm()) {
      console.log('[v0] Proceeding to payment with data:', {
        items,
        customer: formData,
        total: totalPrice,
      })
      alert('Redirigiendo a la página de pago...')
      // Here you would integrate with Stripe or another payment provider
    }
  }

  const handleSheetChange = (open: boolean) => {
    if (!open) {
      setCheckoutStep('cart')
    }
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg bg-white">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl text-gray-900">
            {checkoutStep === 'checkout' && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToCart}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <ShoppingBag className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            {checkoutStep === 'cart' ? 'Tu Pedido' : 'Datos de Entrega'}
          </SheetTitle>
          <SheetDescription>
            {checkoutStep === 'cart'
              ? `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'} en tu carrito`
              : 'Completa tus datos para continuar'}
          </SheetDescription>
        </SheetHeader>

        {checkoutStep === 'cart' ? (
          <>
            <div className="mt-8 flex flex-col gap-4 h-[calc(100vh-250px)] overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                  <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                  <p className="text-gray-400 text-sm">Agrega productos del menú para comenzar</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="font-bold" style={{ color: 'var(--color-primary)' }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                      <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 10%, white)'
                            e.currentTarget.style.color = 'var(--color-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = ''
                            e.currentTarget.style.color = ''
                          }}
                          onClick={() => {
                            // Using null for colorId since Restaurant items typically don't have colors
                            // or adapting to existing store signature
                            const colorId = item.color?.id // Pass existing colorId if any
                            if (item.quantity === 1) {
                              onRemoveItem(item.productId)
                            } else {
                              onUpdateQuantity(item.productId, item.quantity - 1)
                            }
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 10%, white)'
                            e.currentTarget.style.color = 'var(--color-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = ''
                            e.currentTarget.style.color = ''
                          }}
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                        onClick={() => onRemoveItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-700">Subtotal</span>
                    <span className="font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{formatPrice(totalPrice)}</span>
                  </div>
                  <Button
                    className="w-full text-white font-bold py-6 rounded-xl"
                    size="lg"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
                    }}
                    onClick={handleConfirmOrder}
                  >
                    Confirmar Pedido
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-6 h-[calc(100vh-250px)] overflow-y-auto px-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-semibold">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Ej: Juan Pérez"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value })
                    if (errors.fullName) setErrors({ ...errors, fullName: '' })
                  }}
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ej: juan@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: '' })
                  }}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base font-semibold">
                  Observaciones <span className="text-gray-400 text-sm">(opcional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Ej: Sin cebolla, extra salsa..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="rounded-xl p-4" style={{ 
                background: 'color-mix(in srgb, var(--color-primary) 8%, white)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, white)'
              }}>
                <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span style={{ color: 'var(--color-primary)' }}>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
              <Button
                className="w-full text-white font-bold py-6 rounded-xl"
                size="lg"
                style={{
                  background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
                }}
                onClick={handleProceedToPayment}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Ir a Pagar
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

