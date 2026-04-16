'use client'

import { ArrowLeft, CreditCard, Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { NequiPendingState } from '@/components/checkout/NequiPendingState'
import { NequiPhoneInput } from '@/components/checkout/NequiPhoneInput'
import { CartItemModifiersSummary } from '@/components/gastronomy/atoms/CartItemModifiersSummary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag'
import { nequiPhoneRegex } from '@/lib/schemas/nequi.schema'
import type { CartItem } from '@/types/commerce'

type PaymentMethod = 'cash' | 'mercadopago' | 'nequi'

interface NequiPendingPayload {
  orderId: number | string
  nequiTransactionId: string
}

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
    phone: '',
    notes: '',
  })
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resolvedTenantId, setResolvedTenantId] = useState<number | undefined>(undefined)
  const [mpConfigured, setMpConfigured] = useState(false)
  const [nequiConfigured, setNequiConfigured] = useState(false)
  const [nequiPhone, setNequiPhone] = useState('')
  const [nequiPhoneError, setNequiPhoneError] = useState<string | undefined>(undefined)
  const [nequiPending, setNequiPending] = useState<NequiPendingPayload | null>(null)
  const params = useParams()
  const tenantId = params?.tenantId as string

  // Resolve numeric tenant id (slug or numeric route segment)
  const numericFromRoute = Number.parseInt(tenantId ?? '', 10)
  const routeIsNumeric = !Number.isNaN(numericFromRoute)
  const flagTenantId = routeIsNumeric ? numericFromRoute : resolvedTenantId

  const { enabled: nequiFlagEnabled } = useFeatureFlag('nequi_enabled', {
    tenantId: flagTenantId,
  })
  const { enabled: mpFlagEnabled } = useFeatureFlag('mercadopago_enabled', {
    tenantId: flagTenantId,
  })

  // Fetch public tenant config on open to resolve numericId + payment methods available
  useEffect(() => {
    if (!open || !tenantId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/tenant/${tenantId}/config`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (typeof data?.numericId === 'number') {
          setResolvedTenantId(data.numericId)
        }
        setNequiConfigured(Boolean(data?.paymentMethods?.nequi))
        setMpConfigured(Boolean(data?.paymentMethods?.mercadopago))
      } catch {
        // Non-fatal — gated options just won't show
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, tenantId])

  const isCop = currency === 'COP'
  const showNequiOption = isCop && nequiConfigured && nequiFlagEnabled
  const showMpOption = mpConfigured && mpFlagEnabled

  // Auto-fallback if the current selection becomes unavailable
  useEffect(() => {
    if (paymentMethod === 'mercadopago' && !showMpOption) {
      setPaymentMethod('cash')
    }
    if (paymentMethod === 'nequi' && !showNequiOption) {
      setPaymentMethod('cash')
    }
  }, [paymentMethod, showMpOption, showNequiOption])

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
      phone: '',
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido'
    }

    setErrors(newErrors)
    return !newErrors.fullName && !newErrors.email && !newErrors.phone
  }

  const handleConfirmOrder = () => {
    setCheckoutStep('checkout')
  }

  const handleBackToCart = () => {
    setCheckoutStep('cart')
  }

  const handleProceedToPayment = async () => {
    if (!validateForm()) return

    // Pre-validate Nequi phone client-side
    if (paymentMethod === 'nequi') {
      if (!nequiPhoneRegex.test(nequiPhone)) {
        setNequiPhoneError('Debe iniciar en 3 y tener 10 dígitos')
        return
      }
      setNequiPhoneError(undefined)
    }

    setIsSubmitting(true)

    try {
      // Create order and payment preference
      const checkoutResponse = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId,
          paymentMethod: paymentMethod,
          returnUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
          customer: {
            name: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            notes: formData.notes,
          },
          items: items.map((item) => ({
            productId: Number(item.productId),
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            currency: item.currency,
            image: item.image,
          })),
          total: totalPrice,
          currency: currency,
          ...(paymentMethod === 'nequi' ? { nequiPhoneNumber: nequiPhone } : {}),
        }),
      })

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json()
        console.error('Checkout preference creation failed:', error)
        const errorMsg = error.details
          ? `${error.error}: ${error.details}`
          : error.error || 'Error al crear la preferencia de pago'
        throw new Error(errorMsg)
      }

      const data = await checkoutResponse.json()

      if (paymentMethod === 'cash') {
        const locale = params?.locale || 'es'
        window.location.href = `/${locale}/${tenantId}/checkout/success?orderId=${data.orderId}`
      } else if (paymentMethod === 'nequi') {
        // Don't redirect — show inline pending state with deep-link + polling
        const { orderId, nequiTransactionId } = data
        if (!orderId || !nequiTransactionId) {
          throw new Error('Respuesta inválida del servidor Nequi')
        }
        setNequiPending({ orderId, nequiTransactionId })
      } else {
        // MercadoPago: redirect to payment gateway
        window.location.href = data.checkoutUrl || data.initPoint
      }
    } catch (error) {
      console.error('Checkout error:', error)

      let message = 'Ocurrió un error inesperado'

      if (error instanceof Error) {
        if (error.message.includes('MercadoPago') || error.message.includes('not configured')) {
          message = 'Proveedor de pagos no disponible. Por favor contacta con el negocio.'
        } else {
          message = error.message
        }
      }

      toast.error(message)
      setIsSubmitting(false)
    }
  }

  const handleNequiApproved = () => {
    if (!nequiPending) return
    const locale = params?.locale || 'es'
    const { orderId } = nequiPending
    setNequiPending(null)
    onOpenChange(false)
    window.location.href = `/${locale}/${tenantId}/checkout/success?orderId=${orderId}`
  }

  const handleNequiRejected = (_reason: 'denied' | 'cancelled' | 'expired' | 'failed') => {
    // NequiPendingState swaps to terminal view internally.
  }

  const handleNequiRetry = () => {
    setNequiPending(null)
    setIsSubmitting(false)
  }

  const handleSheetChange = (open: boolean) => {
    if (!open) {
      setCheckoutStep('cart')
    }
    onOpenChange(open)
  }

  return (
    <Sheet open={open} onOpenChange={handleSheetChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-background text-foreground"
        data-testid={checkoutStep === 'checkout' ? 'checkout-modal-overlay' : undefined}
      >
        {/* Nequi pending takeover — replaces the whole sheet body with the pending state UI */}
        {nequiPending ? (
          <div className="flex h-full items-center justify-center">
            <NequiPendingState
              orderId={nequiPending.orderId}
              nequiTransactionId={nequiPending.nequiTransactionId}
              phoneNumber={nequiPhone}
              totalAmount={totalPrice}
              currency="COP"
              onApproved={handleNequiApproved}
              onRejected={handleNequiRejected}
              onRetry={handleNequiRetry}
            />
          </div>
        ) : (
          <>
            {/* Loading Overlay (hidden during nequi pending) */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-50 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <Loader2
                    className="h-10 w-10 animate-spin"
                    style={{ color: 'var(--color-primary)' }}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {paymentMethod === 'nequi'
                      ? 'Abriendo Nequi...'
                      : 'Redirigiendo a MercadoPago...'}
                  </p>
                </div>
              </div>
            )}

            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-2xl text-gray-900 dark:text-white">
                {checkoutStep === 'checkout' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    onClick={handleBackToCart}
                    disabled={isSubmitting}
                  >
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
                      <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Tu carrito está vacío
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        Agrega productos del menú para comenzar
                      </p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {item.name}
                          </h3>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <CartItemModifiersSummary
                              productId={item.productId}
                              modifiers={item.modifiers}
                            />
                          )}
                          {item.originalPrice != null && item.originalPrice !== item.price && (
                            <p
                              data-testid="cart-item-original-price"
                              className="text-xs line-through text-gray-400 mt-0.5"
                            >
                              {formatPrice(item.originalPrice * item.quantity)}
                            </p>
                          )}
                          <p
                            data-testid={
                              item.originalPrice != null && item.originalPrice !== item.price
                                ? 'cart-item-discounted-price'
                                : undefined
                            }
                            className="font-bold mt-1"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {formatPrice(
                              (item.price + (item.modifiersTotalDelta ?? 0)) * item.quantity,
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                                e.currentTarget.style.color = 'var(--color-primary)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = ''
                                e.currentTarget.style.color = ''
                              }}
                              onClick={() => {
                                // Using null for colorId since gastronomy items typically don't have colors
                                // or adapting to existing store signature
                                const _colorId = item.color?.id // Pass existing colorId if any
                                if (item.quantity === 1) {
                                  onRemoveItem(item.productId)
                                } else {
                                  onUpdateQuantity(item.productId, item.quantity - 1)
                                }
                              }}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  'color-mix(in srgb, var(--color-primary) 15%, transparent)'
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
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-lg">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Subtotal
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center text-xl">
                        <span className="font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                      <Button
                        data-testid="cart-checkout-button"
                        className="w-full text-white font-bold py-6 rounded-xl"
                        size="lg"
                        style={{
                          background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`,
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
                    <Label
                      htmlFor="fullName"
                      className="text-base font-semibold text-gray-900 dark:text-white"
                    >
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      data-testid="checkout-input-name"
                      placeholder="Ej: Juan Pérez"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value })
                        if (errors.fullName) setErrors({ ...errors, fullName: '' })
                      }}
                      className={errors.fullName ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-base font-semibold text-gray-900 dark:text-white"
                    >
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      data-testid="checkout-input-email"
                      type="email"
                      placeholder="Ej: juan@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (errors.email) setErrors({ ...errors, email: '' })
                      }}
                      className={errors.email ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-base font-semibold text-gray-900 dark:text-white"
                    >
                      Teléfono <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      data-testid="checkout-input-phone"
                      type="tel"
                      placeholder="Ej: 1234567890"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value })
                        if (errors.phone) setErrors({ ...errors, phone: '' })
                      }}
                      className={errors.phone ? 'border-red-500' : ''}
                      disabled={isSubmitting}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 dark:text-white">
                      Método de Pago <span className="text-red-500">*</span>
                    </Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input
                          type="radio"
                          data-testid="checkout-payment-cash"
                          name="payment"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={() => setPaymentMethod('cash')}
                          disabled={isSubmitting}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-900 dark:text-white">Pago en Efectivo</span>
                      </label>
                      {showMpOption && (
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                          <input
                            type="radio"
                            data-testid="checkout-payment-mercadopago"
                            name="payment"
                            value="mercadopago"
                            checked={paymentMethod === 'mercadopago'}
                            onChange={() => setPaymentMethod('mercadopago')}
                            disabled={isSubmitting}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-900 dark:text-white">
                            MercadoPago (Online)
                          </span>
                        </label>
                      )}
                      {showNequiOption && (
                        <label
                          data-testid="nequi-payment-option"
                          className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value="nequi"
                            checked={paymentMethod === 'nequi'}
                            onChange={() => setPaymentMethod('nequi')}
                            disabled={isSubmitting}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="text-gray-900 dark:text-white font-medium">Nequi</div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Push a tu app Nequi (Colombia)
                            </p>
                          </div>
                        </label>
                      )}
                    </div>
                    {paymentMethod === 'nequi' && (
                      <div className="pt-2">
                        <NequiPhoneInput
                          value={nequiPhone}
                          onChange={(stripped) => {
                            setNequiPhone(stripped)
                            if (nequiPhoneError && nequiPhoneRegex.test(stripped)) {
                              setNequiPhoneError(undefined)
                            }
                          }}
                          error={nequiPhoneError}
                          disabled={isSubmitting}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="notes"
                      className="text-base font-semibold text-gray-900 dark:text-white"
                    >
                      Observaciones{' '}
                      <span className="text-gray-400 dark:text-gray-600 text-sm">(opcional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      data-testid="checkout-input-notes"
                      placeholder="Ej: Sin cebolla, extra salsa..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div
                    className="rounded-xl p-4 dark:bg-gray-800 dark:border dark:border-gray-700"
                    style={{
                      background: 'color-mix(in srgb, var(--color-primary) 8%, var(--background))',
                      border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Resumen del Pedido
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatPrice(
                              (item.price + (item.modifiersTotalDelta ?? 0)) * item.quantity,
                            )}
                          </span>
                        </div>
                      ))}
                      <Separator className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span className="dark:text-white">Total</span>
                        <span style={{ color: 'var(--color-primary)' }}>
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    data-testid="checkout-submit-button"
                    className="w-full text-white font-bold py-6 rounded-xl"
                    size="lg"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = `linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, black), color-mix(in srgb, var(--color-primary) 70%, black))`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.background = `linear-gradient(to right, var(--color-primary), color-mix(in srgb, var(--color-primary) 85%, black))`
                      }
                    }}
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Ir a Pagar
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
