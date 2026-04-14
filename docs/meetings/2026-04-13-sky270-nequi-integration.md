# Nequi push payment integration

> **Fecha:** 2026-04-13 | **Participantes:** Aurora, Kokoro, Pixel, Centinela | **Issue:** [SKY-270](https://linear.app/publica/issue/SKY-270)

## Decisiones necesarias

1. Schema JSONB `tenants.nequi_credentials` — shape exacto y validación
2. Ubicación del Nequi REST client + approach SigV4 (lib vs native crypto)
3. Polling endpoint — nuevo `/api/orders/[orderId]/status` o extender existente
4. Intervalo de polling y timeout total desde el frontend
5. Layout del settings form — nuevo card independiente o integrado con card MP
6. UX del pending state en checkout — componente, copy, afordancias
7. Estrategia de mocking de Nequi API en E2E (fixtures vs intercept)
8. Brand-safe pending state visual — no spinner genérico, identidad Nequi-aware

---

## Propuestas

### Aurora

| Decisión | Propuesta | Justificación |
|---|---|---|
| 5 | Nequi card: integrado en settings, tab separado `"Nequi"`. Labels: `Credenciales Nequi`, `Clave de firma` (top label, 0.75rem, secondary text). Spacing: 1rem gaps, input padding 0.5rem (8px grid). Reutiliza CardSection + shadcn form. | Coherencia visual MP + settings existentes; reduce nav friction; reutiliza componentes probados. |
| 6 | Pending state: centered text `Abriendo Nequi...` (Cinzel, 1.5rem, color-text-primary). Icon 48px below (nequi pink #F8008C pulse animation 1.5s). Countdown `mm:ss` numeric (secondary text, -0.5rem margin-top). Click: intent `nequi://` for deep-link; fallback browser to app store. | Nequi brand confidence; countdown drives urgency; native app affordance via deep-link intent. |
| 8 | Success: pulse bg (--color-bg-subtle, 2.5s cycle), check icon (electric-blue). Error states: DENIED → red (#ef4444) `Nequi rechazó el pago` + help link. CANCELED → muted text `Pagador canceló`. Expired → warning state `Ventana cerrada (5 min)`. All states: 0.8s reveal animation (ease-out-expo). | Visual hierarchy via color + icon; status clarity; no spinner (editorial aesthetic). |

**Necesito de otros:**
- Kokoro: confirm `nequi://` deep-link scheme + callback URL; app detection on mobile
- Pixel: test intent fallback (not installed → App Store/Play Store redirect)

**Conflicto que veo:**
- Nequi pink (#F8008C) contrasts editorial monochrome. Solution: accent-only (icon pulse); text stays editorial palette. Chart-1 (e76e50) alternative if pink not approved.

### Kokoro

| Decisión | Propuesta | Justificación |
|---|---|---|
| 1 | `tenants.secure_config JSONB` → agregar key `nequi`: `{ client_id: string, api_key: string, app_secret: string, phone_number: string }` — cifrado AES-256-GCM via `encryptToken` igual que `mp_access_token` | Reutiliza infra de cifrado existente; `secure_config` es el campo correcto para credenciales sensibles |
| 2 | `services/nequi/nequi.client.ts` — usa `node:crypto` nativo para SigV4 (sin lib); estructura: `NequiClient` class con métodos `requestPayment()` + `getPaymentStatus()` | Sin dependencias nuevas; AWS SigV4 es 40 líneas con `node:crypto`; misma capa que MP preference builder |
| 3 | Nuevo endpoint `GET /api/orders/[orderId]/nequi-status` — no extender el existente | El endpoint actual retorna datos de order genéricos; Nequi polling necesita mapear status codes numéricos (33/35/71/10-454/10-455) a `pending/paid/failed/expired/cancelled` sin contaminar la ruta base |
| 7 | — (Centinela) | |

**Necesito de otros:**
- Pixel: shape exacto del request body que envía al crear preferencia Nequi (phone del comprador viene del cart o del checkout form)
- Gonza: confirmación de que `secure_config` ya existe en schema o si necesito migración nueva

**Conflicto que veo:**
- Decisión 3 puede chocar con Pixel si ya tiene lógica de polling en `useOrderStatus` hook apuntando a ruta existente — coordinar contrato antes de que Pixel empiece

### Pixel

| Decisión | Propuesta | Justificación |
|---|---|---|
| 1 | — | (Kokoro) |
| 2 | — | (Kokoro) |
| 3 | Consumir `GET /api/orders/[orderId]/nequi-status` via hook `useNequiStatus(orderId)` en `hooks/useNequiStatus.ts`; retorna `{status, elapsedMs, remainingMs}`. | Hook aislado evita contaminar `useOrderStatus`; alineado con ruta nueva de Kokoro. |
| 4 | Delay inicial 3s, intervalo 5s, timeout cliente 300s (5min), backoff a 10s tras 60s sin cambio. Abort via `AbortController` al desmontar o al llegar a estado terminal. | 5s = balance UX/carga; 300s = ventana push Nequi; backoff reduce requests en colas largas. |
| 5 | Tab separado `Nequi` en `app/[locale]/[tenantId]/dashboard/settings/nequi/page.tsx` + componente `components/dashboard/settings/NequiSettingsForm.tsx` (shadcn Form + react-hook-form + zod). De acuerdo con Aurora. | Aísla credenciales Nequi de MP; permite validación independiente; patrón replicable por payment method. |
| 6 | Componente `components/checkout/NequiPendingState.tsx`. Props: `{orderId, phoneNumber, totalAmount, currency, onApproved, onRejected, onExpired}`. Deep-link `nequi://` al montar (window.location), fallback `https://play.google.com/store/apps/details?id=com.nequi.MobileApp` tras 1.5s si `document.hidden === false`. Timer cliente `useCountdown(300)` + `useNequiStatus(orderId)` en paralelo. Copy per Aurora spec. | Separación clara checkout vs pending; props tipadas; deep-link best-effort con fallback store. |
| 7 | — | (Centinela) |
| 8 | Phone input: `components/checkout/NequiPhoneInput.tsx`, react-hook-form + zod `/^3\d{9}$/`, mask `300 123 4567` via `onChange` formatter, `maxLength={13}`, `inputMode="tel"`, helper `Número Nequi (celular Colombia, 10 dígitos)`, error `Debe iniciar en 3 y tener 10 dígitos`. | Formato Colombia validado client-side; mask visual pero stripped antes del submit; evita errores SigV4 por phone mal formateado. |

**Test-ID contract (Centinela):**
- `nequi-settings-form`, `nequi-settings-client-id-input`, `nequi-settings-api-key-input`, `nequi-settings-app-secret-input`, `nequi-settings-phone-input`, `nequi-settings-save-button`, `nequi-settings-success-toast`, `nequi-settings-error-toast`
- `nequi-phone-input`, `nequi-phone-error`, `nequi-submit-button`
- `nequi-pending-state`, `nequi-pending-icon`, `nequi-countdown-timer`, `nequi-deep-link-fallback`
- `nequi-payment-approved`, `nequi-payment-rejected`, `nequi-payment-expired`, `nequi-payment-canceled`
- `nequi-status-poll-indicator` (dev-only), `nequi-retry-button`

**Necesito de otros:**
- Kokoro: contrato exacto del response `GET /nequi-status` → `{status: 'pending'|'paid'|'failed'|'expired'|'cancelled', raw_status_code?, message?, updated_at}`
- Aurora: confirmar que pink #F8008C queda aislado a icon pulse (no tocar `--color-primary` del tenant)

**Conflicto que veo:**
- Ninguno — polling hook es nuevo, no toca `useOrderStatus` existente (resuelve el conflicto que Kokoro anticipó).

### Centinela

| Decisión | Propuesta | Justificación |
|---|---|---|
| 1 | — | |
| 2 | Unit suite `tests/unit/services/nequi/nequi.client.test.ts` con golden vectors SigV4 (canonical request, string-to-sign, signature) + verificación HMAC-SHA384 Digest/Signature | Cripto sin cobertura = riesgo crítico por RBT; vectores golden detectan regresiones silenciosas |
| 3 | — | |
| 4 | — | |
| 5 | — | |
| 6 | Gap: falta `nequi-deeplink-button` y `nequi-store-fallback-link` (Pixel listó `nequi-deep-link-fallback` pero no el trigger) — pedir ambos al contrato | Sin test-id el fallback mobile queda fuera de cobertura E2E |
| 7 | Mock via `page.route()` sobre `/api/checkout/create-preference`, `/api/orders/*/nequi-status` y `/api/webhooks/nequi`; fixtures en `tests/e2e/fixtures/nequi/` (success/denied/canceled/expired/invalid-sig.json); helper `tests/e2e/helpers/nequi.helper.ts` espejo de `mercadopago.helper.ts` con `signWebhookPayload()` usando `node:crypto` HMAC-SHA384; 8 specs en `tests/e2e/specs/checkout-nequi.spec.ts` + `tests/e2e/specs/admin/nequi-settings.spec.ts` — (1) settings_save_credentials_encrypted_persisted, (2) checkout_happy_path_SUCCESS, (3) checkout_user_CANCELED, (4) checkout_nequi_DENIED, (5) checkout_timeout_expired (`clock.install` + `advance(300_000)`), (6) currency_gating_ARS_hides_nequi_COP_shows, (7) phone_validation_invalid_regex, (8) webhook_invalid_signature_returns_401 | Reutiliza patrón MP 3-tier probado; route intercept evita llamadas reales; clock.install = timeout determinista; cubre branches RBT críticos (cripto, currency gating, webhook auth) |
| 8 | — | |

**Necesito de otros:**
- Pixel: agregar `nequi-deeplink-button` + `nequi-store-fallback-link` al contrato y confirmar `nequi-payment-canceled` (listado) matchea copy Aurora
- Kokoro: exponer `NEQUI_MOCK_MODE=1` env var que bypassee SigV4 real en test runs y acepte fixtures locales

**Conflicto que veo:**
- ninguno

---

## Conflictos

| # | Tema | Agent A | Agent B | Resolución |
|---|---|---|---|---|
| 1 | Polling endpoint podría chocar con `useOrderStatus` | Kokoro: endpoint nuevo | Pixel: hook nuevo `useNequiStatus` | Resuelto — hook y endpoint aislados, no tocan la infra existente |
| 2 | Gap test-id: falta `nequi-deeplink-button` + `nequi-store-fallback-link` | Centinela: necesita ambos | Pixel: listó solo `nequi-deep-link-fallback` | Resuelto — Pixel agrega los 2 IDs al contrato |
| 3 | Nequi pink #F8008C vs monochrome editorial Micelio | Aurora: pink como accent en icon pulse | — | Auto-resuelto — pink solo en icon, texto en palette editorial |
| 4 | `secure_config` existe o requiere migración | Kokoro: pendiente confirmar | — | Resuelto — CLAUDE.md confirma que existe (MP ya lo usa) |

---

## Decisiones finales

| # | Decisión | Resolución | Owner |
|---|---|---|---|
| 1 | Schema credenciales | `tenants.secure_config.nequi = {client_id, api_key, app_secret, phone_number}` cifrado AES-256-GCM via `encryptToken` existente. Sin migración. | Kokoro |
| 2 | Nequi REST client | `services/nequi/nequi.client.ts` con `node:crypto` para SigV4. Clase `NequiClient` con `requestPayment()` + `getPaymentStatus()`. Sin deps nuevas. | Kokoro |
| 3 | Polling endpoint | Nuevo `GET /api/orders/[orderId]/nequi-status`. Response: `{status: 'pending'\|'paid'\|'failed'\|'expired'\|'cancelled', raw_status_code?, message?, updated_at}`. Mapea status numérico Nequi (33/35/71/10-454/10-455). | Kokoro |
| 4 | Polling client | Hook `hooks/useNequiStatus.ts` — delay 3s, interval 5s, timeout 300s, backoff a 10s tras 60s, AbortController on unmount. | Pixel |
| 5 | Settings form | Tab separado `app/[locale]/[tenantId]/dashboard/settings/nequi/page.tsx` + `components/dashboard/settings/NequiSettingsForm.tsx` (shadcn Form + react-hook-form + zod). | Pixel + Aurora |
| 6 | Pending state UX | `components/checkout/NequiPendingState.tsx` + `components/checkout/NequiPhoneInput.tsx`. Deep-link `nequi://` con fallback store tras 1.5s. Countdown `mm:ss` cliente + poll paralelo. Phone input Colombia `/^3\d{9}$/` con mask. | Pixel |
| 7 | Testing strategy | Playwright `page.route()` intercept + fixtures en `tests/e2e/fixtures/nequi/` + `tests/e2e/helpers/nequi.helper.ts` (con `signWebhookPayload()` HMAC-SHA384). 8 specs E2E + unit tests SigV4 con golden vectors. `NEQUI_MOCK_MODE=1` env bypass. | Centinela + Kokoro |
| 8 | Visual states | SUCCESS (electric-blue check), DENIED (red `Nequi rechazó el pago`), CANCELED (muted `Pagador canceló`), EXPIRED (warning `Ventana cerrada 5 min`). 0.8s ease-out-expo reveal. Pink `#F8008C` solo en icon pulse 1.5s. | Aurora (spec) → Pixel (impl) |
| 9 | Test-ID contract addendum | Agregar `nequi-deeplink-button` + `nequi-store-fallback-link` al contrato inicial de Pixel. | Pixel |

## Timeline

| Día | Entregable | Owner | Depende de |
|---|---|---|---|
| D+0 | Migration verify + `NequiClient` (SigV4 + HTTP wrapper) | Kokoro | — |
| D+0 | Copy finalizado + icon asset + design tokens audit | Aurora | — |
| D+1 | Endpoint `/nequi-status` + webhook `/api/webhooks/nequi` + checkout branch | Kokoro | D+0 NequiClient |
| D+1 | Unit tests SigV4 (golden vectors) | Centinela | D+0 NequiClient |
| D+2 | `NequiSettingsForm` + settings tab | Pixel | D+1 API contract |
| D+2 | `NequiPhoneInput` + `NequiPendingState` + `useNequiStatus` hook | Pixel | D+1 polling endpoint |
| D+3 | E2E specs (8 scenarios) + `nequi.helper.ts` + fixtures | Centinela | D+2 test-ids de Pixel + `NEQUI_MOCK_MODE` de Kokoro |
| D+4 | Testing E2E con tenant piloto (Ramiro, credenciales reales) | Centinela + Kokoro | D+3 |

## Pendientes (usuario)

- Confirmar que Ramiro tiene credenciales Nequi Conecta (sandbox + producción) listas para testing E2E en D+4
- Aprobar uso de Nequi pink `#F8008C` como accent en icon pulse — alternativa: chart-1 `#e76e50` (Aurora)
- ¿Activar feature flag `nequi_enabled` para rollout controlado en prod (solo tenants específicos) o abierto a todos los tenants con credenciales?
- ¿Hay dominio de callback para webhook Nequi ya reservado? (ej: `https://micelio.skyw.app/api/webhooks/nequi`) — necesario para registrar en portal Nequi Conecta
