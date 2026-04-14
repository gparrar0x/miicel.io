/**
 * NequiPendingState
 *
 * Overlay shown after `POST /api/checkout/create-preference` with method `nequi`.
 * Displays push prompt, countdown, deep-link CTA, and terminal state variants.
 *
 * Visual spec: docs/specs/SKY-270-nequi-visual-spec.md
 * Polling: lib/hooks/useNequiStatus.ts
 * Issue: SKY-273
 */

'use client'

import { AlertCircle, Check, Clock, Smartphone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { useNequiStatus } from '@/lib/hooks/useNequiStatus'

export type NequiRejectionReason = 'denied' | 'cancelled' | 'expired' | 'failed'

export interface NequiPendingStateProps {
  orderId: number | string
  nequiTransactionId: string
  phoneNumber: string
  totalAmount: number
  currency: 'COP'
  onApproved: () => void
  onRejected: (reason: NequiRejectionReason) => void
  onRetry?: () => void
}

// Nequi brand pink — single approved usage in the entire app.
// Do not reference outside this file.
const NEQUI_PINK = '#F8008C'

const IOS_STORE = 'https://apps.apple.com/co/app/nequi/id1159942331'
const ANDROID_STORE = 'https://play.google.com/store/apps/details?id=com.nequi.MobileApp'

function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

function detectStoreUrl(): string {
  if (typeof navigator === 'undefined') return ANDROID_STORE
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ? IOS_STORE : ANDROID_STORE
}

function attemptDeepLink() {
  if (typeof window === 'undefined') return
  try {
    window.location.href = 'nequi://'
  } catch {
    // Some browsers throw if scheme not registered — fail silent.
  }
}

// ---------------------------------------------------------------------------
// Pulse animation styles — injected once.
// ---------------------------------------------------------------------------

const PULSE_STYLES = `
@keyframes nequi-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
    filter: drop-shadow(0 0 0 rgba(248, 0, 140, 0.4));
  }
  50% {
    transform: scale(1.08);
    opacity: 0.85;
    filter: drop-shadow(0 0 12px rgba(248, 0, 140, 0.5));
  }
}
@keyframes nequi-success-pulse {
  0%, 100% { background-color: var(--color-bg-subtle, #f5f5f5); }
  50% { background-color: color-mix(in oklch, #0047ff 8%, var(--color-bg-subtle, #f5f5f5)); }
}
@keyframes nequi-reveal {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .nequi-pulse-icon { animation: none !important; opacity: 1 !important; }
  .nequi-success-bg { animation: none !important; }
  .nequi-reveal { animation: none !important; }
}
`

function PulseStyles() {
  return <style dangerouslySetInnerHTML={{ __html: PULSE_STYLES }} />
}

// ---------------------------------------------------------------------------
// Container — shared by pending + terminal states
// ---------------------------------------------------------------------------

interface ContainerProps {
  testId: string
  background?: string
  className?: string
  ariaLive?: 'polite' | 'assertive'
  children: React.ReactNode
}

function StateContainer({
  testId,
  background,
  className = '',
  ariaLive = 'polite',
  children,
}: ContainerProps) {
  return (
    <div
      data-testid={testId}
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      className={`nequi-reveal flex flex-col items-center justify-center ${className}`}
      style={{
        minHeight: '320px',
        maxWidth: '480px',
        width: '100%',
        padding: '2rem',
        gap: '1.5rem',
        background: background ?? 'var(--color-bg-elevated, #fff)',
        border: '1px solid var(--color-border, #e5e5e5)',
        borderRadius: 'var(--radius, 0.5rem)',
        boxShadow: 'var(--shadow-float, 0 20px 40px -10px rgba(0,0,0,0.15))',
        animation: 'nequi-reveal 0.8s var(--ease-out-expo, cubic-bezier(0.19, 1, 0.22, 1))',
      }}
    >
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PENDING
// ---------------------------------------------------------------------------

interface PendingViewProps {
  orderId: number | string
  nequiTransactionId: string
  totalAmount: number
  onApproved: () => void
  onRejected: (reason: NequiRejectionReason) => void
}

function NequiPendingView({
  orderId,
  nequiTransactionId,
  totalAmount,
  onApproved,
  onRejected,
}: PendingViewProps) {
  const { mmss, isExpired, remainingSeconds } = useCountdown(300)
  const [showStoreFallback, setShowStoreFallback] = useState(false)
  const ctaRef = useRef<HTMLAnchorElement | null>(null)
  const [ariaTimeLabel, setAriaTimeLabel] = useState('')

  const { status } = useNequiStatus({
    orderId,
    nequiTransactionId,
    enabled: true,
  })

  // Auto-trigger deep link + visibility fallback
  useEffect(() => {
    attemptDeepLink()
    const t = setTimeout(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setShowStoreFallback(true)
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  // Focus management — bring focus to deep-link CTA on mount
  useEffect(() => {
    ctaRef.current?.focus()
  }, [])

  // Update aria label every 10s to avoid screen-reader spam
  useEffect(() => {
    if (remainingSeconds % 10 === 0) {
      const mm = Math.floor(remainingSeconds / 60)
      const ss = remainingSeconds % 60
      setAriaTimeLabel(`Tiempo restante: ${mm} minutos ${ss} segundos`)
    }
  }, [remainingSeconds])

  // Status side effects
  useEffect(() => {
    if (status === 'paid') {
      onApproved()
    } else if (status === 'failed') {
      onRejected('denied')
    } else if (status === 'cancelled') {
      onRejected('cancelled')
    } else if (status === 'expired') {
      onRejected('expired')
    }
  }, [status, onApproved, onRejected])

  // Countdown expiry → expired
  useEffect(() => {
    if (isExpired) {
      onRejected('expired')
    }
  }, [isExpired, onRejected])

  return (
    <StateContainer testId="nequi-pending-state">
      <PulseStyles />

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--color-text-primary, #111)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Abriendo Nequi...
      </h2>

      <div
        data-testid="nequi-pending-icon"
        className="nequi-pulse-icon"
        aria-hidden="true"
        style={{
          color: NEQUI_PINK,
          marginBottom: '-0.5rem',
          animation: 'nequi-pulse 1.5s ease-in-out infinite',
        }}
      >
        <Smartphone size={48} strokeWidth={2} color={NEQUI_PINK} fill="none" aria-hidden="true" />
      </div>

      <div
        data-testid="nequi-countdown-timer"
        role="timer"
        aria-label={ariaTimeLabel}
        style={{
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          fontSize: '2rem',
          fontWeight: 500,
          color: 'var(--color-text-secondary, #666)',
          letterSpacing: '0.02em',
          marginTop: '-0.5rem',
        }}
      >
        {mmss}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-body, Inter)',
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          color: 'var(--color-text-secondary, #666)',
          textAlign: 'center',
          maxWidth: '36ch',
          textWrap: 'balance',
          margin: 0,
        }}
      >
        Abre la app Nequi en tu celular y confirma el pago con tu PIN
      </p>

      <div
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '0.875rem',
          color: 'var(--color-text-tertiary, #999)',
        }}
      >
        {formatCop(totalAmount)}
      </div>

      {/* Deep-link CTA — uses anchor for href + window.location.href on click */}
      <a
        ref={ctaRef}
        href="nequi://"
        data-testid="nequi-deeplink-button"
        onClick={(e) => {
          e.preventDefault()
          attemptDeepLink()
        }}
        className="inline-flex items-center justify-center w-full font-semibold text-center transition-all"
        style={{
          minHeight: '48px',
          background: 'var(--color-primary, #1a1a1a)',
          color: 'var(--primary-foreground, #fff)',
          fontFamily: 'var(--font-body, Inter)',
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: 'var(--radius, 0.5rem)',
          boxShadow: 'var(--shadow-brutal, 4px 4px 0px 0px rgba(0,0,0,1))',
          padding: '0.75rem 1.5rem',
          textDecoration: 'none',
        }}
      >
        Abrir Nequi
      </a>

      {showStoreFallback && (
        <a
          href={detectStoreUrl()}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="nequi-store-fallback-link"
          style={{
            color: 'var(--color-text-tertiary, #999)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body, Inter)',
            textDecoration: 'underline',
          }}
        >
          ¿No tienes Nequi? Descargar
        </a>
      )}

      {process.env.NODE_ENV !== 'production' && (
        <div
          data-testid="nequi-status-poll-indicator"
          aria-hidden="true"
          style={{ display: 'none' }}
        >
          {status}
        </div>
      )}
    </StateContainer>
  )
}

// ---------------------------------------------------------------------------
// SUCCESS
// ---------------------------------------------------------------------------

interface SuccessProps {
  onComplete: () => void
}

export function NequiPaymentApproved({ onComplete }: SuccessProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <StateContainer
      testId="nequi-payment-approved"
      className="nequi-success-bg"
      background="var(--color-bg-subtle, #f5f5f5)"
    >
      <PulseStyles />
      <div
        className="nequi-success-bg"
        style={{
          animation: 'nequi-success-pulse 2.5s ease-in-out infinite',
          borderRadius: '50%',
          padding: '0.5rem',
        }}
      >
        <Check size={48} strokeWidth={2.5} color="#0047ff" aria-hidden="true" />
      </div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary, #111)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Pago aprobado
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body, Inter)',
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          color: 'var(--color-text-secondary, #666)',
          textAlign: 'center',
          maxWidth: '36ch',
          margin: 0,
        }}
      >
        Tu pago fue confirmado. Te llevamos a tu pedido.
      </p>
    </StateContainer>
  )
}

// ---------------------------------------------------------------------------
// REJECTED (denied / cancelled / failed) + EXPIRED
// ---------------------------------------------------------------------------

interface TerminalProps {
  reason: NequiRejectionReason
  orderId: number | string
  onRetry: () => void
}

const TERMINAL_COPY: Record<
  NequiRejectionReason,
  {
    testId: string
    background: string
    iconColor: string
    Icon: typeof X
    heading: string
    subcopy: string
    showHelp: boolean
  }
> = {
  denied: {
    testId: 'nequi-payment-rejected',
    background: 'rgba(239, 68, 68, 0.06)',
    iconColor: '#ef4444',
    Icon: X,
    heading: 'Nequi rechazó el pago',
    subcopy: 'El banco rechazó la transacción. Revisa tu saldo o intenta otro método.',
    showHelp: true,
  },
  failed: {
    testId: 'nequi-payment-rejected',
    background: 'rgba(239, 68, 68, 0.06)',
    iconColor: '#ef4444',
    Icon: AlertCircle,
    heading: 'Nequi rechazó el pago',
    subcopy: 'No pudimos procesar el pago. Intenta de nuevo en unos minutos.',
    showHelp: true,
  },
  cancelled: {
    testId: 'nequi-payment-canceled',
    background: 'var(--muted, #f5f5f5)',
    iconColor: 'var(--color-text-tertiary, #999)',
    Icon: X,
    heading: 'Pago cancelado',
    subcopy: 'Cancelaste el pago desde tu app Nequi.',
    showHelp: false,
  },
  expired: {
    testId: 'nequi-payment-expired',
    background: 'rgba(245, 158, 11, 0.08)',
    iconColor: '#f59e0b',
    Icon: Clock,
    heading: 'Ventana cerrada (5 min)',
    subcopy: 'Pasó el tiempo para confirmar el pago. Intenta de nuevo.',
    showHelp: false,
  },
}

export function NequiTerminalState({ reason, orderId, onRetry }: TerminalProps) {
  const copy = TERMINAL_COPY[reason]
  const { Icon } = copy
  const retryRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    retryRef.current?.focus()
  }, [])

  return (
    <StateContainer testId={copy.testId} background={copy.background}>
      <PulseStyles />
      <Icon size={48} strokeWidth={2.5} color={copy.iconColor} aria-hidden="true" />
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary, #111)',
          textAlign: 'center',
          margin: 0,
        }}
      >
        {copy.heading}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body, Inter)',
          fontSize: '0.9375rem',
          lineHeight: 1.5,
          color: 'var(--color-text-secondary, #666)',
          textAlign: 'center',
          maxWidth: '36ch',
          margin: 0,
        }}
      >
        {copy.subcopy}
      </p>

      <button
        ref={retryRef}
        type="button"
        data-testid="nequi-retry-button"
        onClick={onRetry}
        className="inline-flex items-center justify-center w-full font-semibold transition-all"
        style={{
          minHeight: '48px',
          background: 'var(--color-primary, #1a1a1a)',
          color: 'var(--primary-foreground, #fff)',
          fontFamily: 'var(--font-body, Inter)',
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: 'var(--radius, 0.5rem)',
          boxShadow: 'var(--shadow-brutal, 4px 4px 0px 0px rgba(0,0,0,1))',
          border: 'none',
          padding: '0.75rem 1.5rem',
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>

      {copy.showHelp && (
        <a
          data-testid="nequi-help-link"
          href={`mailto:soporte@micelio.skyw.app?subject=Pago%20Nequi%20rechazado&body=Order%20ID:%20${orderId}`}
          style={{
            color: 'var(--color-text-secondary, #666)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body, Inter)',
            textDecoration: 'underline',
          }}
        >
          ¿Necesitas ayuda?
        </a>
      )}
    </StateContainer>
  )
}

// ---------------------------------------------------------------------------
// Wrapper component — manages internal terminal state transitions.
// ---------------------------------------------------------------------------

type InternalView = 'pending' | 'approved' | NequiRejectionReason

export function NequiPendingState(props: NequiPendingStateProps) {
  const { orderId, nequiTransactionId, totalAmount, onApproved, onRejected, onRetry } = props
  const [view, setView] = useState<InternalView>('pending')

  const handleApproved = () => {
    setView('approved')
  }

  const handleRejected = (reason: NequiRejectionReason) => {
    setView(reason)
    onRejected(reason)
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      setView('pending')
    }
  }

  if (view === 'approved') {
    return <NequiPaymentApproved onComplete={onApproved} />
  }

  if (view === 'denied' || view === 'failed' || view === 'cancelled' || view === 'expired') {
    return <NequiTerminalState reason={view} orderId={orderId} onRetry={handleRetry} />
  }

  return (
    <NequiPendingView
      orderId={orderId}
      nequiTransactionId={nequiTransactionId}
      totalAmount={totalAmount}
      onApproved={handleApproved}
      onRejected={handleRejected}
    />
  )
}
