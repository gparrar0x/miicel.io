/**
 * CheckoutModal Component
 *
 * Complete checkout flow with customer form, payment selection, and MercadoPago integration.
 * SKY-5.1: Customer form with validation
 * SKY-5.2: Payment integration with MercadoPago
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cartStore'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

// Validation schema - Only MercadoPago supported (SKY-4)
const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits for WhatsApp')
    .min(10, 'Phone must be 10 digits')
    .max(10, 'Phone must be 10 digits'),
  email: z.string().email('Invalid email address'),
  notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mercadopago'>('mercadopago')
  const { items, getTotalPrice, clearCart } = useCartStore()
  const params = useParams()
  const tenantId = params?.tenantId as string

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const totalPrice = getTotalPrice()
  const currency = items[0]?.currency || 'USD'

  if (!open) return null

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Create order and MP preference in one call
      const checkoutResponse = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId,
          paymentMethod: paymentMethod,
          returnUrl: typeof window !== 'undefined' ? window.location.origin : undefined, // Send actual browser URL
          customer: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            notes: data.notes,
          },
          items: items.map(item => ({
            productId: Number(item.productId),
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            currency: item.currency,
            image: item.image,
            sizeId: item.size?.id, // Include size for stock validation
          })),
          total: totalPrice,
          currency: currency,
        }),
      })

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json()
        console.error('Checkout preference creation failed:', error)
        const errorMsg = error.details
          ? `${error.error}: ${error.details} ${error.code ? `(${error.code})` : ''}`
          : error.error || 'Failed to create checkout preference'
        throw new Error(errorMsg)
      }

      const response = await checkoutResponse.json()

      // Clear cart before redirect
      clearCart()

      // Handle response based on payment method
      if (paymentMethod === 'mercadopago') {
        // Redirect to MercadoPago
        const { initPoint } = response
        window.location.href = initPoint
      } else if (paymentMethod === 'cash') {
        // Redirect to success page for cash payment
        const { orderId } = response
        window.location.href = `/${tenantId}/checkout/success?orderId=${orderId}`
      }
    } catch (error) {
      console.error('Checkout error:', error)

      let message = 'An unexpected error occurred'

      if (error instanceof Error) {
        if (error.message.includes('stock')) {
          message = 'Some products are out of stock. Please review your cart.'
        } else if (error.message.includes('MercadoPago') || error.message.includes('not configured')) {
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

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        data-testid="checkout-modal-backdrop"
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto max-h-[90vh] overflow-y-auto relative" data-testid="checkout-modal-container">
          {/* Loading Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm text-gray-600">Redirecting to payment...</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Checkout
            </h2>
            <button
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
            style={{ backgroundColor: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}
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
                <span
                  style={{ color: 'var(--color-primary)' }}
                  data-testid="checkout-total"
                >
                  {currency} {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="checkout-form">
            {/* Name Field */}
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

            {/* Phone Field */}
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

            {/* Email Field */}
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

            {/* Notes Field */}
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
              <label className="block text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Payment Method
              </label>

              {/* Cash Payment Option */}
              <div className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: paymentMethod === 'cash' ? 'var(--color-primary)' : 'var(--color-border)' }}
                onClick={() => setPaymentMethod('cash')}>
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
                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Cash on Delivery</div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Pay when you receive your order</p>
                </label>
              </div>

              {/* MercadoPago Payment Option */}
              <div className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: paymentMethod === 'mercadopago' ? 'var(--color-primary)' : 'var(--color-border)' }}
                onClick={() => setPaymentMethod('mercadopago')}>
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
                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>MercadoPago</div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Credit/debit card or local payment methods</p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' }}
              data-testid="checkout-submit-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Proceed to Payment - ${currency} ${totalPrice.toFixed(2)}`
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
