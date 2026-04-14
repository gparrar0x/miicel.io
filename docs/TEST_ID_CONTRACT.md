# TEST_ID_CONTRACT

> Single source of truth for `data-testid` attributes shared between Pixel (UI) and Centinela (E2E).
> Updated: 2026-04-13

Pixel emits these IDs in the DOM. Centinela locks against them in `tests/e2e/locators/`.
Any change here requires a coordinated PR touching both sides.

---

## Nequi

Owner: SKY-270 (parent), SKY-273 (Pixel), SKY-274 (Centinela)
Locators: `tests/e2e/locators/nequi.locators.ts`
Components: `components/dashboard/settings/NequiSettingsForm.tsx`, `components/checkout/NequiPhoneInput.tsx`, `components/checkout/NequiPendingState.tsx`, `components/CheckoutModal.tsx`

### Admin — Settings form

| test-id | Element | Component |
|---|---|---|
| `nequi-settings-form` | form root | NequiSettingsForm |
| `nequi-settings-client-id-input` | client_id input | NequiSettingsForm |
| `nequi-settings-api-key-input` | api_key input | NequiSettingsForm |
| `nequi-settings-app-secret-input` | app_secret input | NequiSettingsForm |
| `nequi-settings-phone-input` | merchant phone input | NequiSettingsForm |
| `nequi-settings-save-button` | submit button | NequiSettingsForm |
| `nequi-settings-success-toast` | success toast (sonner) | NequiSettingsForm |
| `nequi-settings-error-toast` | error toast (sonner) | NequiSettingsForm |
| `nequi-settings-status-badge` | Activo / Sin configurar | NequiSettingsForm |
| `nequi-settings-currency-warning` | shown when currency != COP | NequiSettingsForm |

### Checkout — payment option + buyer phone

| test-id | Element | Component |
|---|---|---|
| `nequi-payment-option` | radio for Nequi method | CheckoutModal |
| `nequi-phone-input` | buyer phone input | NequiPhoneInput |
| `nequi-phone-error` | inline phone error | NequiPhoneInput |
| `nequi-submit-button` | submit (replaces generic checkout button when Nequi selected) | CheckoutModal |

### Checkout — pending state

| test-id | Element | Component |
|---|---|---|
| `nequi-pending-state` | container | NequiPendingState |
| `nequi-pending-icon` | pulsing smartphone icon | NequiPendingState |
| `nequi-countdown-timer` | mm:ss countdown | NequiPendingState |
| `nequi-deeplink-button` | Abrir Nequi CTA | NequiPendingState |
| `nequi-store-fallback-link` | App Store / Play link | NequiPendingState |
| `nequi-status-poll-indicator` | dev-only polling state marker | NequiPendingState |

### Checkout — terminal states

| test-id | Element | Component |
|---|---|---|
| `nequi-payment-approved` | success container | NequiPendingState |
| `nequi-payment-rejected` | rejected/denied container | NequiPendingState |
| `nequi-payment-canceled` | user-cancelled container | NequiPendingState |
| `nequi-payment-expired` | 5-min timeout container | NequiPendingState |
| `nequi-retry-button` | reintentar button (terminal states) | NequiPendingState |
