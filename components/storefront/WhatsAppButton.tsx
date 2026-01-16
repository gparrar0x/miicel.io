/**
 * WhatsAppButton - Floating action button for WhatsApp contact
 *
 * Features:
 * - Fixed position floating button (bottom-right)
 * - WhatsApp brand colors (#25D366)
 * - Opens wa.me link in new tab
 * - Hidden when no phoneNumber provided
 * - Accessible with proper ARIA labels
 *
 * Test ID: whatsapp-button
 * Created: SKY-47
 */

'use client'

import { MessageCircle } from 'lucide-react'

interface WhatsAppButtonProps {
  phoneNumber?: string | null
}

/**
 * Floating WhatsApp button
 * Opens WhatsApp chat with pre-configured number
 */
export function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  // Hide button if no number configured
  if (!phoneNumber) return null

  // Remove any spaces, hyphens, parentheses from number
  const cleanNumber = phoneNumber.replace(/[\s\-()]/g, '')

  const handleClick = () => {
    window.open(`https://wa.me/${cleanNumber}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      data-testid="whatsapp-button"
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50
                 w-14 h-14 rounded-full
                 bg-[#25D366] hover:bg-[#20BD5A]
                 text-white shadow-lg
                 flex items-center justify-center
                 transition-all duration-200
                 hover:scale-110 active:scale-95"
      aria-label="Contact us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  )
}
