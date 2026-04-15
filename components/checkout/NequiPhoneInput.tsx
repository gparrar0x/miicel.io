/**
 * NequiPhoneInput
 *
 * Controlled phone input for buyer's Colombian Nequi number.
 * Display: masked `3XX XXX XXXX`. Storage: stripped 10-digit string.
 *
 * Validation regex `/^3\d{9}$/` lives in lib/schemas/nequi.schema.ts.
 *
 * Issue: SKY-273
 */

'use client'

import { AlertCircle } from 'lucide-react'
import type * as React from 'react'
import { useId } from 'react'
import { formatNequiPhoneMask, stripNequiPhoneMask } from '@/lib/schemas/nequi.schema'

export interface NequiPhoneInputProps {
  value: string
  onChange: (stripped: string) => void
  error?: string
  disabled?: boolean
  'data-testid'?: string
}

export function NequiPhoneInput({
  value,
  onChange,
  error,
  disabled,
  'data-testid': testId = 'nequi-phone-input',
}: NequiPhoneInputProps) {
  const inputId = useId()
  const helperId = useId()
  const errorId = useId()

  const display = formatNequiPhoneMask(value)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stripped = stripNequiPhoneMask(event.target.value)
    onChange(stripped)
  }

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block mb-1.5"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        Tu número Nequi
      </label>
      <input
        id={inputId}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={display}
        onChange={handleChange}
        disabled={disabled}
        maxLength={13}
        placeholder="300 123 4567"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperId}
        data-testid={testId}
        className="w-full rounded-md border bg-background px-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          height: '40px',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          borderColor: error ? '#ef4444' : 'var(--color-border)',
          borderWidth: '1px',
        }}
      />
      {error ? (
        <p
          id={errorId}
          data-testid="nequi-phone-error"
          className="mt-1.5 flex items-center gap-1"
          style={{
            color: '#ef4444',
            fontSize: '0.75rem',
            fontWeight: 500,
            fontFamily: 'var(--font-body)',
          }}
        >
          <AlertCircle aria-hidden="true" size={14} />
          <span>{error}</span>
        </p>
      ) : (
        <p
          id={helperId}
          className="mt-1.5"
          style={{
            color: 'var(--color-text-tertiary, #999)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
          }}
        >
          Número de celular Colombia registrado en Nequi
        </p>
      )}
    </div>
  )
}
