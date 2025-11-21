"use client"

import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
}

export function CartSheet({ open, onOpenChange, cart, onUpdateQuantity, onRemoveItem }: CartSheetProps) {
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout">("cart")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    notes: "",
  })
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  })

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "El nombre completo es requerido"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    setErrors(newErrors)
    return !newErrors.fullName && !newErrors.email
  }

  const handleConfirmOrder = () => {
    setCheckoutStep("checkout")
  }

  const handleBackToCart = () => {
    setCheckoutStep("cart")
  }

  const handleProceedToPayment = () => {
    if (validateForm()) {
      console.log("[v0] Proceeding to payment with data:", {
        cart,
        customer: formData,
        total: totalPrice,
      })
      alert("Redirigiendo a la página de pago...")
      // Here you would integrate with Stripe or another payment provider
    }
  }

  const handleSheetChange = (open: boolean) => {
    if (!open) {
      setCheckoutStep("cart")
    }
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            {checkoutStep === "checkout" && (
              <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToCart}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            {checkoutStep === "cart" ? "Tu Pedido" : "Datos de Entrega"}
          </SheetTitle>
          <SheetDescription>
            {checkoutStep === "cart"
              ? `${totalItems} ${totalItems === 1 ? "producto" : "productos"} en tu carrito`
              : "Completa tus datos para continuar"}
          </SheetDescription>
        </SheetHeader>

        {checkoutStep === "cart" ? (
          <>
            <div className="mt-8 flex flex-col gap-4 h-[calc(100vh-250px)] overflow-y-auto px-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                  <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                  <p className="text-gray-400 text-sm">Agrega productos del menú para comenzar</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-orange-600 font-bold">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => {
                            if (item.quantity === 1) {
                              onRemoveItem(item.id)
                            } else {
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-700">Subtotal</span>
                    <span className="font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-orange-600">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 rounded-xl"
                    size="lg"
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
                    if (errors.fullName) setErrors({ ...errors, fullName: "" })
                  }}
                  className={errors.fullName ? "border-red-500" : ""}
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
                    if (errors.email) setErrors({ ...errors, email: "" })
                  }}
                  className={errors.email ? "border-red-500" : ""}
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

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Resumen del Pedido</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 rounded-xl"
                size="lg"
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
