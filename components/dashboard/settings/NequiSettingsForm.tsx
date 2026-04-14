/**
 * NequiSettingsForm
 *
 * Admin form to configure Nequi Conecta credentials per tenant.
 * - 4 fields: client_id, api_key, app_secret, phone_number
 * - Reveal toggles for sensitive fields
 * - Currency gating: warning + disabled save if tenant.currency !== 'COP'
 * - Status badge: Activo / Sin configurar
 *
 * Saves via PATCH /api/settings with body { nequi_credentials: {...} }.
 * Backend (services/nequi/...) encrypts credentials before persist.
 *
 * Issue: SKY-273
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Eye, EyeOff, Loader2, Save } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatNequiPhoneMask,
  type NequiCredentialsInput,
  nequiCredentialsSchema,
  stripNequiPhoneMask,
} from '@/lib/schemas/nequi.schema'

export interface NequiSettingsFormProps {
  tenantId: number
}

interface SettingsResponse {
  nequi_configured?: boolean
  nequi_phone_number?: string | null
  config?: { currency?: string }
}

export function NequiSettingsForm({ tenantId }: NequiSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [configured, setConfigured] = useState(false)
  const [currency, setCurrency] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showAppSecret, setShowAppSecret] = useState(false)
  const [showClientId, setShowClientId] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<NequiCredentialsInput>({
    resolver: zodResolver(nequiCredentialsSchema),
    mode: 'onChange',
    defaultValues: {
      client_id: '',
      api_key: '',
      app_secret: '',
      phone_number: '',
    },
  })

  const phoneValue = watch('phone_number') || ''

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/settings?tenant_id=${tenantId}`)
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data: SettingsResponse = await res.json()
      setConfigured(Boolean(data.nequi_configured))
      setCurrency(data.config?.currency ?? null)
      if (data.nequi_phone_number) {
        setValue('phone_number', data.nequi_phone_number)
      }
    } catch (err) {
      console.error('[NequiSettingsForm] fetch error:', err)
    } finally {
      setFetching(false)
    }
  }, [tenantId, setValue])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const isCop = currency === 'COP'

  const onSubmit = async (data: NequiCredentialsInput) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/settings?tenant_id=${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nequi_credentials: {
            client_id: data.client_id.trim(),
            api_key: data.api_key.trim(),
            app_secret: data.app_secret.trim(),
            phone_number: data.phone_number.trim(),
          },
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'No pudimos guardar')
      }

      toast.success('Credenciales guardadas', {
        // biome-ignore lint/suspicious/noExplicitAny: sonner toast options accept data attrs at runtime
        ...({ 'data-testid': 'nequi-settings-success-toast' } as any),
      })
      setConfigured(true)
    } catch (err) {
      console.error('[NequiSettingsForm] save error:', err)
      toast.error('No pudimos guardar. Intenta de nuevo.', {
        // biome-ignore lint/suspicious/noExplicitAny: sonner toast options accept data attrs at runtime
        ...({ 'data-testid': 'nequi-settings-error-toast' } as any),
      })
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body, Inter)',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary, #666)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.375rem',
    display: 'block',
  }

  const inputStyle = (hasError: boolean, mono: boolean): React.CSSProperties => ({
    width: '100%',
    height: '40px',
    padding: '0.5rem 2.25rem 0.5rem 0.75rem',
    border: `1px solid ${hasError ? '#ef4444' : 'var(--color-border, #e5e5e5)'}`,
    borderRadius: 'var(--radius, 0.5rem)',
    background: 'var(--background, #fff)',
    color: 'var(--color-text-primary, #111)',
    fontFamily: mono ? 'var(--font-mono, "JetBrains Mono", monospace)' : 'var(--font-body, Inter)',
    fontSize: '0.875rem',
  })

  const helperStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: 'var(--color-text-tertiary, #999)',
    marginTop: '0.375rem',
    fontFamily: 'var(--font-body, Inter)',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.375rem',
    fontFamily: 'var(--font-body, Inter)',
    fontWeight: 500,
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">Credenciales Nequi Conecta</CardTitle>
            <CardDescription
              style={{
                fontFamily: 'var(--font-body, Inter)',
                fontSize: '0.9375rem',
                color: 'var(--color-text-secondary, #666)',
                marginTop: '0.5rem',
              }}
            >
              Configura tu cuenta de negocio Nequi para aceptar pagos en Colombia
            </CardDescription>
          </div>
          {!fetching && (
            <Badge
              data-testid="nequi-settings-status-badge"
              variant={configured ? 'default' : 'secondary'}
              style={{
                background: configured ? 'rgba(16, 185, 129, 0.12)' : undefined,
                color: configured ? '#059669' : undefined,
                borderRadius: '9999px',
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {configured ? 'Activo' : 'Sin configurar'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!fetching && !isCop && (
          <div
            data-testid="nequi-settings-currency-warning"
            role="alert"
            className="flex items-start gap-3 mb-6"
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius, 0.5rem)',
              fontFamily: 'var(--font-body, Inter)',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--color-text-primary, #111)',
            }}
          >
            <AlertTriangle size={18} color="#f59e0b" aria-hidden="true" />
            <span>
              Nequi requiere pesos colombianos (COP). Cambia la moneda del tenant para activar.
            </span>
          </div>
        )}

        <form
          data-testid="nequi-settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Client ID */}
          <div>
            <label htmlFor="nequi-client-id" style={labelStyle}>
              Client ID
            </label>
            <div className="relative">
              <input
                id="nequi-client-id"
                type={showClientId ? 'text' : 'password'}
                placeholder="123e4567-e89b-12d3-a456-426614174000"
                data-testid="nequi-settings-client-id-input"
                aria-invalid={errors.client_id ? 'true' : 'false'}
                style={inputStyle(Boolean(errors.client_id), true)}
                {...register('client_id')}
              />
              <button
                type="button"
                onClick={() => setShowClientId((v) => !v)}
                aria-label={showClientId ? 'Ocultar Client ID' : 'Mostrar Client ID'}
                data-testid="nequi-settings-client-id-reveal"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center hover:text-foreground"
                style={{
                  width: '32px',
                  height: '32px',
                  color: 'var(--color-text-tertiary, #999)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showClientId ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.client_id && <p style={errorStyle}>{errors.client_id.message}</p>}
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="nequi-api-key" style={labelStyle}>
              API Key
            </label>
            <div className="relative">
              <input
                id="nequi-api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="ak_live_••••••••••••••••"
                data-testid="nequi-settings-api-key-input"
                aria-invalid={errors.api_key ? 'true' : 'false'}
                style={inputStyle(Boolean(errors.api_key), true)}
                {...register('api_key')}
              />
              <button
                type="button"
                onClick={() => setShowApiKey((v) => !v)}
                aria-label={showApiKey ? 'Ocultar API Key' : 'Mostrar API Key'}
                data-testid="nequi-settings-api-key-reveal"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  color: 'var(--color-text-tertiary, #999)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.api_key && <p style={errorStyle}>{errors.api_key.message}</p>}
          </div>

          {/* App Secret */}
          <div>
            <label htmlFor="nequi-app-secret" style={labelStyle}>
              App Secret
            </label>
            <div className="relative">
              <input
                id="nequi-app-secret"
                type={showAppSecret ? 'text' : 'password'}
                placeholder="••••••••••••••••••••••••"
                data-testid="nequi-settings-app-secret-input"
                aria-invalid={errors.app_secret ? 'true' : 'false'}
                style={inputStyle(Boolean(errors.app_secret), true)}
                {...register('app_secret')}
              />
              <button
                type="button"
                onClick={() => setShowAppSecret((v) => !v)}
                aria-label={showAppSecret ? 'Ocultar App Secret' : 'Mostrar App Secret'}
                data-testid="nequi-settings-app-secret-reveal"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  width: '32px',
                  height: '32px',
                  color: 'var(--color-text-tertiary, #999)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showAppSecret ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.app_secret && <p style={errorStyle}>{errors.app_secret.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="nequi-phone" style={labelStyle}>
              Teléfono comercio
            </label>
            <input
              id="nequi-phone"
              type="tel"
              inputMode="tel"
              placeholder="300 123 4567"
              maxLength={13}
              data-testid="nequi-settings-phone-input"
              aria-invalid={errors.phone_number ? 'true' : 'false'}
              value={formatNequiPhoneMask(phoneValue)}
              onChange={(e) =>
                setValue('phone_number', stripNequiPhoneMask(e.target.value), {
                  shouldValidate: true,
                })
              }
              style={{
                ...inputStyle(Boolean(errors.phone_number), false),
                paddingRight: '0.75rem',
              }}
            />
            {errors.phone_number ? (
              <p style={errorStyle}>{errors.phone_number.message}</p>
            ) : (
              <p style={helperStyle}>Número del celular del comercio registrado en Nequi</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || !isCop || !isValid || fetching}
              aria-disabled={loading || !isCop || !isValid || fetching}
              data-testid="nequi-settings-save-button"
              className="w-full"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar credenciales
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
