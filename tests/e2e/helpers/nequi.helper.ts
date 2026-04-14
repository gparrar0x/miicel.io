/**
 * Nequi E2E Helper
 *
 * Mirrors the shape of mercadopago.helper.ts for Nequi push payments.
 *
 * Provides:
 * - Route mocks for the checkout preference + status polling endpoints
 *   (no real Nequi API call required during E2E)
 * - Webhook helpers (POST raw JSON with HMAC-SHA384 signature)
 * - Tenant seeding utilities (writes Nequi credentials + feature flag via Supabase admin)
 *
 * Issue: SKY-274
 */

import * as crypto from 'node:crypto'
import type { APIRequestContext, APIResponse, Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NequiPollingStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'

export interface NequiCheckoutPreferenceResponse {
  success: true
  orderId: number
  nequiTransactionId: string
}

export interface NequiCredentialsRaw {
  client_id: string
  api_key: string
  app_secret: string
  phone_number: string
}

export interface NequiWebhookPayload {
  commerceCode: string
  value: string
  phoneNumber: string
  messageId: string
  transactionId: string
  region: 'C001'
  receivedAt: string
  paymentStatus: 'SUCCESS' | 'CANCELED' | 'DENIED'
}

// ---------------------------------------------------------------------------
// Route mocks (page-side)
// ---------------------------------------------------------------------------

/**
 * Stub POST /api/checkout/create-preference so the Nequi flow proceeds without
 * touching the real backend. Returns the supplied preference shape.
 */
export async function mockNequiCheckoutPreference(
  page: Page,
  response: NequiCheckoutPreferenceResponse,
): Promise<void> {
  await page.route('**/api/checkout/create-preference', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

/**
 * Stub GET /api/orders/{id}/nequi-status so the polling hook receives a
 * deterministic status. Use `delayMs` to simulate a few pending ticks before
 * a terminal status (the polling hook will keep calling and we keep returning
 * the same response — Playwright mocks are stateless by default).
 *
 * For a "pending → terminal" transition, call this twice: first with `pending`
 * + a delay, then re-mock with the terminal status using `unroute` + new route.
 */
export async function mockNequiStatusPolling(
  page: Page,
  status: NequiPollingStatus,
  options: { delayMs?: number; rawCode?: string } = {},
): Promise<void> {
  await page.unroute('**/api/orders/*/nequi-status').catch(() => {})

  await page.route('**/api/orders/*/nequi-status', async (route) => {
    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs))
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status,
        ...(options.rawCode ? { raw_status_code: options.rawCode } : {}),
        updated_at: new Date().toISOString(),
      }),
    })
  })
}

// ---------------------------------------------------------------------------
// Webhook signing + posting (server-side)
// ---------------------------------------------------------------------------

/**
 * Sign the Nequi webhook stringToSign with HMAC-SHA384, base64url encoded.
 * Matches app/api/webhooks/nequi/route.ts logic.
 */
export function signWebhookPayload(stringToSign: string, secret: string): string {
  return crypto.createHmac('sha384', secret).update(stringToSign, 'utf8').digest('base64url')
}

/**
 * POST a webhook payload to /api/webhooks/nequi with valid (or invalid)
 * digest + signature headers.
 *
 * `options.invalidSignature: true` deliberately uses the wrong secret so the
 * webhook responds 401 — used for negative tests.
 */
export async function postMockWebhook(
  request: APIRequestContext,
  baseUrl: string,
  payload: NequiWebhookPayload,
  options: { invalidSignature?: boolean; secret?: string; appSecret?: string } = {},
): Promise<APIResponse> {
  const rawBody = JSON.stringify(payload)
  // appSecret = per-tenant secret; fallback to legacy secret option for compat
  const secret = options.invalidSignature
    ? 'definitely-not-the-real-secret'
    : (options.appSecret ?? options.secret ?? 'test-webhook-secret')

  const digestHeader = `SHA-256=${crypto
    .createHash('sha256')
    .update(rawBody, 'utf8')
    .digest('base64')}`

  const contentType = 'application/json'
  const stringToSign = `content-type: ${contentType}\ndigest: ${digestHeader}`
  const signature = signWebhookPayload(stringToSign, secret)
  const signatureHeader = `keyId="nequi-test", signature="${signature}"`

  return await request.post(`${baseUrl}/api/webhooks/nequi`, {
    headers: {
      'content-type': contentType,
      Digest: digestHeader,
      Signature: signatureHeader,
    },
    data: rawBody,
  })
}

// ---------------------------------------------------------------------------
// Tenant seeding (Supabase admin)
// ---------------------------------------------------------------------------

function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for Nequi seeding',
    )
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Seed a tenant with Nequi credentials + currency in `secure_config.nequi`.
 *
 * NOTE: production code encrypts these via lib/encryption (AES-256-GCM).
 * For test seeding we delegate to the same encryptToken helper if importable;
 * otherwise the raw values are written and the test must run with the dev
 * encryption key matching the service-side decryptToken.
 */
export async function seedTenantWithNequi(
  tenantId: number,
  creds: NequiCredentialsRaw,
  currency: 'COP' | 'ARS' = 'COP',
): Promise<void> {
  const supabase = getSupabaseAdmin()

  // Encrypt at the call site via dynamic import — keeps this helper safe to
  // import from a Node-only context without bundler resolution issues.
  const { encryptToken } = (await import('@/lib/encryption').catch(() => ({
    encryptToken: (s: string) => s,
  }))) as { encryptToken: (s: string) => string }

  const nequi = {
    client_id: encryptToken(creds.client_id),
    api_key: encryptToken(creds.api_key),
    app_secret: encryptToken(creds.app_secret),
    phone_number: creds.phone_number,
  }

  // Read existing secure_config to merge (don't clobber MP token if present)
  const { data: existing } = await supabase
    .from('tenants')
    .select('secure_config')
    .eq('id', tenantId)
    .maybeSingle()

  const merged = {
    ...((existing?.secure_config as Record<string, unknown> | null) ?? {}),
    nequi,
  }

  const { error } = await supabase
    .from('tenants')
    // biome-ignore lint/suspicious/noExplicitAny: supabase generic update typing is loose for jsonb
    .update({ secure_config: merged as any, currency })
    .eq('id', tenantId)

  if (error) {
    throw new Error(`seedTenantWithNequi failed: ${error.message}`)
  }
}

/**
 * Ensure the `nequi_enabled` feature flag is ON for a given tenant.
 */
export async function enableNequiFeatureFlag(tenantId: number): Promise<void> {
  const supabase = getSupabaseAdmin()

  // biome-ignore lint/suspicious/noExplicitAny: feature_flags table types not generated yet
  const { error } = await (supabase.from('feature_flags') as any).upsert(
    {
      key: 'nequi_enabled',
      enabled: true,
      tenant_id: tenantId,
    },
    { onConflict: 'key,tenant_id' },
  )

  if (error) {
    throw new Error(`enableNequiFeatureFlag failed: ${error.message}`)
  }
}

/**
 * Reset a tenant's Nequi config (used after tests to avoid leakage).
 */
export async function clearTenantNequi(tenantId: number): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { data: existing } = await supabase
    .from('tenants')
    .select('secure_config')
    .eq('id', tenantId)
    .maybeSingle()

  const cfg = { ...((existing?.secure_config as Record<string, unknown> | null) ?? {}) }
  delete cfg.nequi

  await supabase
    .from('tenants')
    // biome-ignore lint/suspicious/noExplicitAny: jsonb update typing
    .update({ secure_config: cfg as any })
    .eq('id', tenantId)
}
