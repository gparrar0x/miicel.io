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
                 shadow-lg
                 flex items-center justify-center
                 transition-all duration-200
                 hover:scale-110 active:scale-95"
      aria-label="Contactar por WhatsApp"
      title="Chat en WhatsApp"
    >
      {/* Full-color official WhatsApp icon */}
      <svg
        viewBox="0 0 58 58"
        className="w-14 h-14"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="29" cy="29" r="29" fill="#25D366" />
        <path
          fill="#fff"
          d="M29 13C20.163 13 13 20.163 13 29c0 2.833.737 5.49 2.027 7.8L13 45l8.395-2.004A15.942 15.942 0 0029 45c8.837 0 16-7.163 16-16S37.837 13 29 13zm0 4c6.627 0 12 5.373 12 12s-5.373 12-12 12a11.94 11.94 0 01-6.004-1.618l-.283-.17-4.713 1.134 1.137-4.622-.22-.35A11.956 11.956 0 0117 29c0-6.627 5.373-12 12-12zm-3.4 4.5c-.342 0-.717.124-.991.42-.271.295-1.05 1.02-1.05 2.487s1.075 2.888 1.224 3.087c.149.2 2.1 3.2 5.076 4.485.71.306 1.26.49 1.692.627.714.227 1.363.195 1.875.118.573-.084 1.764-.72 2.012-1.413.249-.693.249-1.287.174-1.411-.073-.124-.272-.199-.57-.348-.299-.149-1.763-.869-2.037-.968-.274-.099-.473-.148-.672.15-.2.298-.77.968-.944 1.165-.174.199-.348.224-.647.075-.299-.149-1.26-.464-2.402-1.477-.885-.79-1.484-1.766-1.657-2.062-.174-.297-.02-.459.131-.606.135-.134.3-.348.449-.523.148-.174.197-.298.297-.497.1-.2.05-.373-.025-.522-.074-.149-.67-1.613-.917-2.208-.244-.582-.49-.502-.672-.511-.173-.008-.373-.01-.572-.01z"
        />
      </svg>
    </button>
  )
}
