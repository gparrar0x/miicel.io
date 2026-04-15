/**
 * CheckoutModal Component
 *
 * Complete checkout flow with customer form, payment selection (cash, MercadoPago, Nequi).
 * SKY-5.1: Customer form with validation
 * SKY-5.2: Payment integration with MercadoPago
 * SKY-273:  Nequi push payment (Colombia, COP only)
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { NequiPendingState } from '@/components/checkout/NequiPendingState'
import { NequiPhoneInput } from '@/components/checkout/NequiPhoneInput'
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag'
import { nequiPhoneRegex } from '@/lib/schemas/nequi.schema'
import { useCartStore } from '@/lib/stores/cartStore'

// Validation schema — phone field is buyer WhatsApp (10 digits, free format)
const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits for WhatsApp')
    .min(10, 'Phone must be 10 digits')
    .max(10, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email address'),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>
type PaymentMethod = 'cash' | 'mercadopago' | 'nequi'

interface NequiPendingPayload {
  orderId: number | string
  nequiTransactionId: string
}

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago')
  const [nequiPhone, setNequiPhone] = useState('')
  const [nequiPhoneError, setNequiPhoneError] = useState<string | undefined>(undefined)
  const [nequiConfigured, setNequiConfigured] = useState(false)
  const [mpConfigured, setMpConfigured] = useState(false)
  const [nequiPending, setNequiPending] = useState<NequiPendingPayload | null>(null)
  const [resolvedTenantId, setResolvedTenantId] = useState<number | undefined>(undefined)

  const { items, getTotalPrice, clearCart } = useCartStore()
  const params = useParams()
  const tenantId = params?.tenantId as string

  // Resolve numeric tenant id. URL segment may be numeric or slug — try numeric first,
  // otherwise fall back to the server-resolved id fetched via /api/tenant/[slug]/config.
  const numericFromRoute = Number.parseInt(tenantId ?? '', 10)
  const routeIsNumeric = !Number.isNaN(numericFromRoute)
  const flagTenantId = routeIsNumeric ? numericFromRoute : resolvedTenantId

  const { enabled: nequiFlagEnabled } = useFeatureFlag('nequi_enabled', {
    tenantId: flagTenantId,
  })
  const { enabled: mpFlagEnabled } = useFeatureFlag('mercadopago_enabled', {
    tenantId: flagTenantId,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const totalPrice = getTotalPrice()
  const currency = items[0]?.currency || 'USD'
  const isCop = currency === 'COP'

  // Fetch public tenant config on open to resolve the numeric id (if route used slug)
  // and to know which payment methods are configured for this tenant.
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
        // Non-fatal — gated methods just won't show
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, tenantId])

  // Reset Nequi sub-state when modal closes
  useEffect(() => {
    if (!open) {
      setNequiPending(null)
      setNequiPhone('')
      setNequiPhoneError(undefined)
      setErrorMessage(null)
    }
  }, [open])

  const showNequiOption = isCop && nequiConfigured && nequiFlagEnabled
  const showMpOption = mpConfigured && mpFlagEnabled

  // If the current selection becomes unavailable (e.g. MP gated off after settings load),
  // fall back to cash so the form always has a valid radio selected.
  useEffect(() => {
    if (paymentMethod === 'mercadopago' && !showMpOption) {
      setPaymentMethod('cash')
    }
    if (paymentMethod === 'nequi' && !showNequiOption) {
      setPaymentMethod('cash')
    }
  }, [paymentMethod, showMpOption, showNequiOption])

  if (!open) return null

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    // Pre-validate Nequi phone client-side
    if (paymentMethod === 'nequi') {
      if (!nequiPhoneRegex.test(nequiPhone)) {
        setNequiPhoneError('Debe iniciar en 3 y tener 10 dígitos')
        setIsSubmitting(false)
        return
      }
      setNequiPhoneError(undefined)
    }

    try {
      const checkoutResponse = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          paymentMethod,
          returnUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
          customer: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            notes: data.notes,
          },
          items: items.map((item) => ({
            productId: Number(item.productId),
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            currency: item.currency,
            image: item.image,
            sizeId: item.size?.id,
          })),
          total: totalPrice,
          currency,
          ...(paymentMethod === 'nequi' ? { nequiPhoneNumber: nequiPhone } : {}),
        }),
      })

      if (!checkoutResponse.ok) {
        let errorMsg = 'Failed to create checkout preference'
        try {
          const error = await checkoutResponse.json()
          console.error('Checkout preference creation failed:', error)
          errorMsg = error.details
            ? `${error.error}: ${error.details} ${error.code ? `(${error.code})` : ''}`
            : error.error || errorMsg
        } catch {
          console.error('Checkout failed with status:', checkoutResponse.status)
        }
        throw new Error(errorMsg)
      }

      const response = await checkoutResponse.json()

      if (paymentMethod === 'mercadopago') {
        clearCart()
        const { initPoint } = response
        window.location.href = initPoint
      } else if (paymentMethod === 'cash') {
        clearCart()
        const { orderId } = response
        window.location.href = `/${tenantId}/checkout/success?orderId=${orderId}`
      } else if (paymentMethod === 'nequi') {
        // Don't clear cart yet — user might cancel push and retry.
        const { orderId, nequiTransactionId } = response
        if (!orderId || !nequiTransactionId) {
          throw new Error('Respuesta inválida del servidor Nequi')
        }
        setNequiPending({ orderId, nequiTransactionId })
      }
    } catch (error) {
      console.error('Checkout error:', error)

      let message = 'An unexpected error occurred'

      if (error instanceof Error) {
        if (error.message.includes('stock')) {
          message = 'Some products are out of stock. Please review your cart.'
        } else if (
          error.message.includes('MercadoPago') ||
          error.message.includes('not configured')
        ) {
          message = 'Payment provider unavailable. Please contact the store.'
        } else {
          message = error.message
        }
      }

      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNequiApproved = () => {
    if (!nequiPending) return
    clearCart()
    const { orderId } = nequiPending
    setNequiPending(null)
    onClose()
    router.push(`/${tenantId}/checkout/success?orderId=${orderId}`)
  }

  const handleNequiRejected = (_reason: 'denied' | 'cancelled' | 'expired' | 'failed') => {
    // NequiPendingState already swaps to terminal view internally.
    // Nothing to do here yet — terminal Reintentar callback resets pending state.
  }

  const handleNequiRetry = () => {
    setNequiPending(null)
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={nequiPending ? undefined : onClose}
        data-testid="checkout-modal-backdrop"
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div
          className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto max-h-[90vh] overflow-y-auto relative"
          data-testid="checkout-modal-container"
        >
          {/* Loading Overlay (hidden during nequi pending — pending state has its own UI) */}
          {isSubmitting && !nequiPending && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2
                  className="h-8 w-8 animate-spin text-primary"
                  style={{ color: 'var(--color-primary)' }}
                />
                <p className="text-sm text-gray-600">
                  {paymentMethod === 'nequi' ? 'Abriendo Nequi...' : 'Redirecting to payment...'}
                </p>
              </div>
            </div>
          )}

          {/* Nequi pending takeover */}
          {nequiPending ? (
            <div className="flex justify-center">
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
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Checkout
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  data-testid="checkout-modal-close"
                  className="p-1 hover:bg-gray-100 rounded"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error Display */}
              {errorMessage && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4"
                  data-testid="checkout-error-message"
                >
                  {errorMessage}
                </div>
              )}

              {/* Order Summary */}
              <div
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border)',
                }}
                data-testid="checkout-order-summary"
              >
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Order Summary
                </h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.color?.id || 'default'}`}
                      className="flex justify-between text-sm"
                      data-testid={`checkout-item-${idx}`}
                    >
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {item.name} {item.color && `(${item.color.name})`} x {item.quantity}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {item.currency} {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between font-bold">
                    <span style={{ color: 'var(--color-text-primary)' }}>Total</span>
                    <span style={{ color: 'var(--color-primary)' }} data-testid="checkout-total">
                      {currency} {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                data-testid="checkout-form"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                    data-testid="checkout-name-input"
                  />
                  {errors.name && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-error)' }}
                      data-testid="checkout-error-name"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    WhatsApp Phone *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: errors.phone ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="1234567890"
                    maxLength={10}
                    disabled={isSubmitting}
                    data-testid="checkout-phone-input"
                  />
                  {errors.phone && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-error)' }}
                      data-testid="checkout-error-phone"
                    >
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                    data-testid="checkout-email-input"
                  />
                  {errors.email && (
                    <p
                      className="text-sm mt-1"
                      style={{ color: 'var(--color-error)' }}
                      data-testid="checkout-error-email"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                    placeholder="Any special instructions..."
                    rows={3}
                    disabled={isSubmitting}
                    data-testid="checkout-input-notes"
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <label
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Payment Method
                  </label>

                  {/* Cash */}
                  <div
                    className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor:
                        paymentMethod === 'cash' ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <input
                      type="radio"
                      id="payment-cash"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                      disabled={isSubmitting}
                      data-testid="checkout-payment-cash"
                      className="mt-1"
                    />
                    <label htmlFor="payment-cash" className="flex-1 cursor-pointer">
                      <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        Cash on Delivery
                      </div>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Pay when you receive your order
                      </p>
                    </label>
                  </div>

                  {/* MercadoPago (gated) */}
                  {showMpOption && (
                    <div
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor:
                          paymentMethod === 'mercadopago'
                            ? 'var(--color-primary)'
                            : 'var(--color-border)',
                      }}
                      onClick={() => setPaymentMethod('mercadopago')}
                    >
                      <input
                        type="radio"
                        id="payment-mercadopago"
                        name="paymentMethod"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'mercadopago')}
                        disabled={isSubmitting}
                        data-testid="checkout-payment-mercadopago"
                        className="mt-1"
                      />
                      <label htmlFor="payment-mercadopago" className="flex-1 cursor-pointer">
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          MercadoPago
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Credit/debit card or local payment methods
                        </p>
                      </label>
                    </div>
                  )}

                  {/* Nequi (gated) */}
                  {showNequiOption && (
                    <div
                      className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor:
                          paymentMethod === 'nequi'
                            ? 'var(--color-primary)'
                            : 'var(--color-border)',
                      }}
                      onClick={() => setPaymentMethod('nequi')}
                    >
                      <input
                        type="radio"
                        id="payment-nequi"
                        name="paymentMethod"
                        value="nequi"
                        checked={paymentMethod === 'nequi'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'nequi')}
                        disabled={isSubmitting}
                        data-testid="nequi-payment-option"
                        className="mt-1"
                      />
                      <label htmlFor="payment-nequi" className="flex-1 cursor-pointer">
                        <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          Nequi
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          Push payment a tu app Nequi (Colombia)
                        </p>
                      </label>
                    </div>
                  )}
                </div>

                {/* Inline Nequi phone input */}
                {paymentMethod === 'nequi' && (
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
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  data-testid={
                    paymentMethod === 'nequi' ? 'nequi-submit-button' : 'checkout-submit-button'
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {paymentMethod === 'nequi' ? 'Abriendo Nequi...' : 'Processing...'}
                    </>
                  ) : paymentMethod === 'nequi' ? (
                    'Pagar con Nequi'
                  ) : (
                    `Proceed to Payment - ${currency} ${totalPrice.toFixed(2)}`
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  )
}
