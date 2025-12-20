/**
 * Checkout Success Page (SKY-5.3)
 *
 * Displays order confirmation after successful checkout
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { CheckCircle, Package, User, CreditCard, ArrowLeft, MessageCircle } from 'lucide-react'

interface OrderData {
  orderId: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    currency: string
  }>
  total: number
  currency: string
  paymentMethod: string
  status: string
  tenantWhatsapp?: string | null
}

export default function CheckoutSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tenantId = params?.tenantId as string

  // MercadoPago query params
  const collectionId = searchParams?.get('collection_id')
  const paymentId = searchParams?.get('payment_id') || collectionId
  const externalReference = searchParams?.get('external_reference')
  const mpStatus = searchParams?.get('status') || searchParams?.get('collection_status')
  const paymentType = searchParams?.get('payment_type')
  const merchantOrderId = searchParams?.get('merchant_order_id')
  const preferenceId = searchParams?.get('preference_id')

  // Fallback to legacy orderId param for backwards compatibility
  const orderId = externalReference || searchParams?.get('orderId')

  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    // Fetch order details
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setOrderData(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch order:', err)
        setError('Failed to load order details')
        setLoading(false)
      })
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center" data-testid="checkout-success-loading">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center" data-testid="checkout-success-error">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <Link
            href={`/${tenantId}`}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            data-testid="checkout-success-back-to-store"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" data-testid="checkout-success-page">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-lg p-8 mb-6 text-center" data-testid="checkout-success-header">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've sent a confirmation email to{' '}
            <span className="font-medium">{orderData.customer.email}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <span className="text-sm text-gray-600">Order:</span>
              <span className="font-mono font-semibold" data-testid="checkout-success-order-id">
                #{orderData.orderId}
              </span>
            </div>
            {paymentId && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-sm text-green-600">Payment:</span>
                <span className="font-mono font-semibold text-green-700" data-testid="checkout-success-payment-id">
                  {paymentId}
                </span>
              </div>
            )}
            {mpStatus && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-600">Status:</span>
                <span className="font-semibold text-blue-700 capitalize" data-testid="checkout-success-payment-status">
                  {mpStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-lg p-6 mb-6" data-testid="checkout-success-customer-info">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900" data-testid="checkout-success-customer-name">
                {orderData.customer.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900" data-testid="checkout-success-customer-email">
                {orderData.customer.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900" data-testid="checkout-success-customer-phone">
                {orderData.customer.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 mb-6" data-testid="checkout-success-order-summary">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
          </div>
          <div className="space-y-3">
            {orderData.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
                data-testid={`checkout-success-item-${idx}`}
              >
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                </div>
                <div className="font-medium text-gray-900">
                  {item.currency} {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t-2">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span
                className="text-2xl font-bold text-green-600"
                data-testid="checkout-success-total"
              >
                {orderData.currency} {orderData.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg p-6 mb-6" data-testid="checkout-success-payment-info">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          </div>
          <div className="text-sm">
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {orderData.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Cash on Delivery'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${tenantId}`}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            data-testid="checkout-success-continue-shopping"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            data-testid="checkout-success-print"
          >
            <Package className="w-5 h-5 mr-2" />
            Print Order
          </button>
          {/* WhatsApp Button - Only show when order is paid and tenant has WhatsApp configured */}
          {orderData.status === 'paid' && orderData.tenantWhatsapp && (() => {
            // Build WhatsApp message with order details
            const whatsappMessage = `Hola! Mi pedido es:\n\n` +
              `*Pedido #${orderData.orderId}*\n\n` +
              `*Cliente:* ${orderData.customer.name}\n` +
              `*Email:* ${orderData.customer.email}\n` +
              `*Teléfono:* ${orderData.customer.phone}\n\n` +
              `*DETALLE DEL PEDIDO:*\n` +
              orderData.items.map(item => 
                `- ${item.name} (x${item.quantity}): ${item.currency} ${(item.price * item.quantity).toFixed(2)}`
              ).join('\n') +
              `\n\n*TOTAL: ${orderData.currency} ${orderData.total.toFixed(2)}*`
            
            // Clean phone number (remove spaces, dashes, etc.)
            const cleanPhone = orderData.tenantWhatsapp.replace(/\D/g, '')
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
            
            return (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                data-testid="checkout-success-whatsapp"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Enviar por WhatsApp
              </a>
            )
          })()}
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ You'll receive an order confirmation email shortly</li>
            <li>✓ We'll notify you when your order is being prepared</li>
            <li>✓ Track your order status via the confirmation email</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
