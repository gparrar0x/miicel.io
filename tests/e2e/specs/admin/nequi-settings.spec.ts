/**
 * Admin Nequi Settings — credentials persistence + encryption
 *
 * Scenario 1 of SKY-274: settings_save_credentials_encrypted_persisted
 *
 * Verifies that an authenticated tenant admin can:
 *   1. Open /dashboard/settings/nequi
 *   2. Submit valid Nequi credentials via the form
 *   3. Receive a success toast + see the Active badge
 *   4. (DB assertion) Confirm credentials are stored encrypted (not plaintext)
 *
 * Encryption check: AES-256-GCM tokens stored by lib/encryption.encryptToken()
 * are NOT equal to the input string. We assert inequality, not a specific
 * format, so the test stays resilient to encryption scheme changes.
 */

import { expect, test } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { loginAsOwner } from '../../fixtures/auth.fixture'
import { NequiSettingsPage } from '../../pages/nequi-settings.page'

test.describe('Admin Nequi Settings — credentials persistence', () => {
  const TEST_TENANT = process.env.TEST_NEQUI_TENANT_SLUG || 'sazon-criollo'

  test('settings_save_credentials_encrypted_persisted', async ({ page }) => {
    await loginAsOwner(page, TEST_TENANT)

    const settingsPage = new NequiSettingsPage(page)
    await settingsPage.goto(TEST_TENANT)
    await settingsPage.expectFormVisible()

    const credentials = {
      clientId: `test-client-id-${Date.now()}`,
      apiKey: `test-api-key-${Date.now()}`,
      appSecret: `test-app-secret-${Date.now()}`,
      phoneNumber: '3001234567',
    }

    await settingsPage.fillCredentials(credentials)
    await settingsPage.save()

    await settingsPage.expectSuccessToast()
    await settingsPage.expectActiveBadge()

    // DB-side assertion — credentials must NOT be stored as plaintext.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })

      const { data } = await supabase
        .from('tenants')
        .select('id, secure_config')
        .eq('slug', TEST_TENANT)
        .single()

      const stored = (data?.secure_config as { nequi?: Record<string, string> } | null)?.nequi
      expect(stored).toBeTruthy()
      // Plaintext leak guard: stored value must differ from input
      expect(stored?.client_id).not.toBe(credentials.clientId)
      expect(stored?.api_key).not.toBe(credentials.apiKey)
      expect(stored?.app_secret).not.toBe(credentials.appSecret)
      // Phone is NOT considered sensitive — stored as-is
      expect(stored?.phone_number).toBe(credentials.phoneNumber)
    }
  })
})
