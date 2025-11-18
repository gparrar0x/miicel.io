/**
 * SKY-43: Badge Component
 * Type + Status badges for product cards
 *
 * Usage:
 * ```tsx
 * <Badge variant="digital" position="top-left">Digital</Badge>
 * <Badge variant="new" position="top-right">New</Badge>
 * ```
 *
 * Features:
 * - Type badges: Digital, Physical, Both
 * - Status badges: New, Limited, Featured
 * - Absolute positioning (top-left/top-right)
 * - Gallery White palette (adjusts for Modern Dark)
 * - WCAG AA contrast (3:1 UI minimum)
 *
 * Test IDs:
 * - badge-type-{digital|physical|both}
 * - badge-status-{new|limited|featured}
 */

'use client'

import { ReactNode } from 'react'

interface BadgeProps {
  variant: 'digital' | 'physical' | 'both' | 'new' | 'limited' | 'featured'
  position?: 'top-left' | 'top-right'
  children: ReactNode
  'data-testid'?: string
}

const BADGE_STYLES = {
  digital: {
    bg: 'var(--badge-digital-bg)',
    text: 'var(--badge-digital-text)',
    border: 'var(--badge-digital-border)',
    testId: 'badge-type-digital',
  },
  physical: {
    bg: 'var(--badge-physical-bg)',
    text: 'var(--badge-physical-text)',
    border: 'var(--badge-physical-border)',
    testId: 'badge-type-physical',
  },
  both: {
    bg: 'var(--badge-both-bg)',
    text: 'var(--badge-both-text)',
    border: 'var(--badge-both-border)',
    testId: 'badge-type-both',
  },
  new: {
    bg: 'var(--badge-new-bg)',
    text: 'var(--badge-new-text)',
    border: 'var(--badge-new-border)',
    testId: 'badge-status-new',
  },
  limited: {
    bg: 'var(--badge-limited-bg)',
    text: 'var(--badge-limited-text)',
    border: 'var(--badge-limited-border)',
    testId: 'badge-status-limited',
  },
  featured: {
    bg: 'var(--badge-featured-bg)',
    text: 'var(--badge-featured-text)',
    border: 'var(--badge-featured-border)',
    testId: 'badge-status-featured',
  },
}

export function Badge({ variant, position = 'top-left', children, 'data-testid': testId }: BadgeProps) {
  const style = BADGE_STYLES[variant]

  return (
    <span
      data-testid={testId || style.testId}
      className="absolute z-10 text-[11px] font-semibold uppercase whitespace-nowrap"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: 'var(--badge-padding)',
        minHeight: 'var(--badge-min-height)',
        minWidth: 'var(--badge-min-width)',
        borderRadius: 'var(--badge-border-radius)',
        top: 'var(--spacing-xs)',
        [position === 'top-left' ? 'left' : 'right']: 'var(--spacing-xs)',
      }}
    >
      {children}
    </span>
  )
}
