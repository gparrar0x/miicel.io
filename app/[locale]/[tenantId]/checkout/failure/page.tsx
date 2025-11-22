/**
 * Checkout Failure Page (SKY-5.3)
 *
 * Displays error message when checkout fails
 */

'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react'

export default function CheckoutFailurePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tenantId = params?.tenantId as string

  // MercadoPago returns: payment_id, status, external_reference (orderId)
  const paymentId = searchParams?.get('payment_id')
  const externalReference = searchParams?.get('external_reference')
  const mpStatus = searchParams?.get('status')

  // Fallback to legacy params
  const orderId = externalReference || searchParams?.get('orderId')
  const error = searchParams?.get('error') || 'Payment was not completed'

  const handleRetry = () => {
    // Navigate back to store (cart might be cleared)
    window.location.href = `/${tenantId}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full" data-testid="checkout-failure-page">
        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3" data-testid="checkout-failure-title">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-2" data-testid="checkout-failure-message">
            {error}
          </p>
          <div className="space-y-1">
            {orderId && (
              <p className="text-sm text-gray-500">
                Order ID:{' '}
                <span className="font-mono font-medium" data-testid="checkout-failure-order-id">
                  {orderId}
                </span>
              </p>
            )}
            {paymentId && (
              <p className="text-sm text-gray-500">
                Payment ID:{' '}
                <span className="font-mono font-medium">
                  {paymentId}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">What happened?</h3>
          <ul className="space-y-1 text-sm text-red-800">
            <li>• Your payment was not processed successfully</li>
            <li>• No charges were made to your account</li>
            <li>• Your cart items are still saved</li>
          </ul>
        </div>

        {/* Common Issues */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Common Issues</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Insufficient funds in your account</li>
            <li>• Incorrect payment details</li>
            <li>• Payment method declined</li>
            <li>• Network connection issues</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            data-testid="retry-payment-button"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <Link
            href={`/${tenantId}`}
            className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            data-testid="checkout-failure-back-to-store"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Store
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href={`mailto:support@example.com?subject=Payment Failed - Order ${orderId || 'N/A'}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
              data-testid="checkout-failure-contact-support"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
