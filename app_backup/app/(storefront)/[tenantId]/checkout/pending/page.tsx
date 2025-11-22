/**
 * Checkout Pending Page (SKY-4)
 *
 * Displays pending payment status from MercadoPago
 */

'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Clock, ArrowLeft, AlertCircle } from 'lucide-react'

export default function CheckoutPendingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const tenantId = params?.tenantId as string
  const paymentId = searchParams?.get('payment_id')
  const orderId = searchParams?.get('external_reference')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full" data-testid="checkout-pending-page">
        {/* Pending Icon */}
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-yellow-600" />
        </div>

        {/* Pending Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3" data-testid="checkout-pending-title">
            Payment Pending
          </h1>
          <p className="text-gray-600 mb-2" data-testid="checkout-pending-message">
            Your payment is being processed. We'll notify you once it's confirmed.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID:{' '}
              <span className="font-mono font-medium" data-testid="checkout-pending-order-id">
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

        {/* Pending Details */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">What's happening?</h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                <li>• Your payment is awaiting confirmation</li>
                <li>• This usually takes a few minutes</li>
                <li>• You'll receive an email once it's processed</li>
                <li>• No action is needed from you</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Common Reasons */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Common Reasons</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Bank transfer pending verification</li>
            <li>• Payment method requires manual approval</li>
            <li>• Transaction being reviewed for security</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/${tenantId}`}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            data-testid="return-home-button"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Store
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Questions?{' '}
            <a
              href={`mailto:support@example.com?subject=Payment Pending - Order ${orderId || 'N/A'}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
              data-testid="checkout-pending-contact-support"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
