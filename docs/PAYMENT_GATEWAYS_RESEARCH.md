# Payment Gateways — Research & Integration Notes

> Consolidated research on payment providers evaluated for Micelio multi-tenant architecture.
> Last updated: 2026-04-13

## Context

Micelio is a multi-tenant e-commerce where each tenant connects their own payment provider (not a marketplace model). Today MercadoPago is the only supported provider. This doc captures everything learned while evaluating additional providers for LATAM expansion, especially Colombia.

---

## Nequi (Colombia) — Primary Research

### Overview

Nequi is Bancolombia's digital wallet, ~26M users in Colombia. API product is called **Nequi Conecta**.

- **Portal:** https://www.nequi.com.co/negocios/apis
- **Docs (auth-gated):** https://docs.conecta.nequi.com.co/
- **Help/activation:** https://ayuda.negocios.nequi.co/hc/es-419/articles/360046706451

### Key constraint

**No OAuth marketplace model.** Unlike MercadoPago, there's no programmatic onboarding flow. Each merchant (tenant) must register individually at Nequi Conecta portal, complete certification (~4 days review), and receive their own API keys. Implication: tenant onboarding for Nequi is manual, not via OAuth redirect.

### Requirements for merchant registration

- Colombian legal entity (persona jurídica) with NIT
- Cámara de Comercio certificate
- Representante legal cédula
- **Bancolombia account** + bank certification
- Shareholder composition doc
- Data authorization form

Foreign companies without Colombian presence **cannot register directly** for Nequi Conecta. They must go through an aggregator.

### Authentication

- **Current:** AWS Signature v4 (JWS) with 3 credentials: Access Key ID, Secret Key, API Key
- **Migrating to:** OAuth 2.0 (announced for October, year unclear — likely 2025/2026)
- **OAuth2 flow:** `POST https://api.nequi.com/token` with Basic auth `base64(client_id:client_secret)` → Bearer token

### Products / Services available

| Product | Use Case | Docs availability |
|---------|----------|-------------------|
| QR dinámico | In-store, web checkout with QR display | Partial |
| Push notification (Unregistered Payment Request) | Web/mobile checkout — backend sends payment request to user's phone | Partial |
| Suscripciones | Recurring debit (first charge approved, subsequent automatic) | Behind cert |
| Dispersiones | Payouts to multiple users | Behind cert |
| Depósitos y retiros | Corresponsalía bancaria | Behind cert |
| Open Banking | Balance/auth queries | Behind cert |
| Remesas | International transfers | Behind cert |

### Push Payment Flow (Unregistered Payment Request)

This is the flow chosen for Micelio implementation (SKY-270).

1. Backend calls Nequi Conecta with buyer's phone number + amount
2. Nequi sends push notification to buyer's Nequi app
3. Buyer approves in-app with PIN
4. Backend receives webhook when transaction completes (or polls status)

**Pros:** No redirect, no QR display needed, smooth mobile UX
**Cons:** Requires accurate phone number capture, buyer must have Nequi installed and notifications enabled

### Webhook Payload (confirmed via DEUNA partner docs)

**Source:** https://docs.deuna.com/docs/nequi-push

```json
{
  "commerceCode": "29603",
  "value": "1",
  "phoneNumber": "3195414070",
  "messageId": "60396545535",
  "transactionId": "350-12345-34000201-60396545535",
  "region": "C001",
  "receivedAt": "2023-02-27T15:50:13.527Z",
  "paymentStatus": "SUCCESS"
}
```

**Field notes:**
- `value` comes as **string**, not number
- `region`: `C001` = Colombia, `P001` = Panama
- `paymentStatus`: `SUCCESS` | `CANCELED` | `DENIED`
- `transactionId` format: `350-{commerce}-{code}-{msgId}`

### Webhook Security Headers (confirmed)

Nequi signs webhooks with **HMAC-SHA384** (not HMAC-SHA256 like MercadoPago).

**`Digest` header:**
```
Digest: SHA-256=<base64(sha256(raw_body))>
```

**`Signature` header:**
```
Signature: keyId="ClientId",algorithm="hmac-sha384",headers="content-type digest",signature="<base64url_hmac>"
```

**Verification pseudocode:**
```typescript
const stringToSign = `content-type: application/json\ndigest: ${digestHeader}`
const computed = base64url(
  HMAC_SHA384(APP_SECRET, stringToSign)
)
// base64url = base64 with + → -, / → _, no padding =
```

### Polling Endpoint (fallback if webhook not configured)

**Endpoint:** `POST https://api.nequi.com/payments/v2/-services-paymentservice-getstatuspayment`

**Headers:**
```
Authorization: Bearer <access_token>
x-api-key: <api_key>
```

**Status codes (numeric, internal to polling response):**
| Code | Meaning |
|------|---------|
| `33` | Pending |
| `35` | Completed |
| `71` | Failed |
| `10-454` | Expired |
| `10-455` | Cancelled/rejected |

**Note:** These numeric codes are different from the webhook `paymentStatus` string values. The webhook uses `SUCCESS/CANCELED/DENIED`, the polling endpoint returns numeric codes.

**Polling recommendation:** Every 5s, for up to 5 minutes, with exponential backoff on errors.

### Webhook Configuration

Webhook URL is configured in the **Nequi Conecta portal** per commerce. If not configured, payments reflect with 2-5 minute lag via polling only.

Some aggregators (like SmartFastPay) allow passing `urlWebhook` in the payment request payload directly, but this is not confirmed for the native Nequi Conecta API.

### Certification Process

1. Analyze docs, choose API
2. Register as Negocio Nequi in portal
3. Integrate in sandbox (Android only)
4. Send evidence to `certificacion@conecta.nequi.com`:
   - Request/response JSON samples
   - Video/GIF of UX flow
5. Nequi team reviews (~4 business days)
6. Provide legal docs (NIT or cédula) → receive production keys

**Multi-tenant implication:** No collective certification for platforms. Each tenant completes this process individually.

### Limits & Restrictions

- **Currency:** COP only (no multi-currency)
- **Per-transaction user limit:** ~COP $5,000,000 (~USD $1,200) for basic accounts
- **Monthly accumulated:** ~COP $10,482,689 (~USD $2,500) for basic accounts
- **User requirement:** Colombian phone number + cédula
- **Sandbox:** Android only, cannot coexist with production Nequi app

### SDKs

- **No official npm package.**
- Reference Node.js client existed at `github.com/nequibc/nequi-api-client-nodejs` — currently only `data` repo (binlist fork) is public. Implementation is REST + axios, useful as code reference only.
- Implementation must be built from scratch using REST calls with SigV4/OAuth2 auth.

### Cost

Direct Nequi Conecta API: 0% for QR negocios (merchant-funded), commission structure for other flows not publicly documented (provided during certification).

---

## Wompi (Colombia) — Aggregator Option

### Overview

Wompi is **owned by Bancolombia** (sister product to Nequi). Primary aggregator for Colombian e-commerce.

- **Website:** https://wompi.co
- **Docs:** https://docs.wompi.co

### Key value

- Native Nequi support as payment method (no separate certification needed)
- Also supports: PSE, Bancolombia Button, cards (local + international), Bancolombia Transfer
- More flexible merchant onboarding than direct Nequi
- API with OAuth 2.0 standard flow

### Pricing

| Method | Fee |
|--------|-----|
| Standard (cards) | 2.65% + $700 COP + IVA |
| Nequi/Bancolombia links | 1.5% + IVA |

No setup cost, no monthly fee.

### Foreign entity support

**Ambiguous.** Docs describe "merchant registration" without explicit exclusion of foreign entities, but business model leans toward Colombian companies. **Requires direct confirmation with Wompi sales** before assuming viability for Skywalking (no Colombian entity).

### When to use

- If Micelio wants to offer Nequi + PSE + cards in one integration
- When tenant is not yet set up with Nequi Conecta directly
- When avoiding the 4-day Nequi certification process

---

## PayU (Colombia + LATAM) — Aggregator Option

### Overview

Multi-country LATAM payment aggregator. Operates in 15+ countries.

- **Website:** https://colombia.payu.com
- **Docs:** https://developers.payulatam.com/latam/es/docs/integrations.html

### Key value

- **Accepts foreign merchants** more readily than Wompi (confirmed in community reports)
- Supports Nequi, PSE, Bancolombia, local/international cards
- Dedicated recurring payment / subscriptions module
- More mature API than Wompi

### Pricing

| Item | Cost |
|------|------|
| Standard commission | 3.29% + $300 COP + IVA |
| Nequi minimum | $450 COP per transaction |
| Setup | None |
| Inactivity fee | $127.700 COP/mo if inactive >6 months |

### When to use

- When tenant is a foreign entity and cannot register with Wompi
- When subscription/recurring payments are needed
- When single-integration, multi-method coverage is priority

---

## Stripe (Global + Colombia) — Global Alternative

### Overview

Global payment processor, available in Colombia since 2020.

- **Website:** https://stripe.com/es-419-co

### Key value

- Accepts **foreign entities** without restriction
- Native subscription support
- Excellent Next.js / React SDK
- Supports Colombian local cards + PSE (with config)

### Limitations

- **Does NOT support Nequi natively**
- Does not reach ~26M Nequi-only users

### Pricing

~2.9% + $0.30 USD per transaction

### When to use

- MVP / global launch before adding LATAM-specific methods
- International tenants
- When subscription billing is the priority and Nequi is nice-to-have

---

## EBANX — Subscription Specialist

### Overview

LATAM-focused payment aggregator with explicit support for **Nequi recurring payments**.

- **Docs:** https://docs.ebanx.com/docs/payments/guides/accept-payments/api/colombia/nequi-recurrent

### Key value

- **Only documented option for native Nequi subscriptions** (as of research date)
- First charge: user approves via push → enrolled
- Subsequent charges: no user interaction required
- This is the only clear path for Nequi-based recurring billing

### When to use

- If/when Micelio adds subscription products with Nequi as payment method
- Out of scope for current SKY-270 (which is one-time checkout only)

---

## DEUNA — Technical Partner

### Overview

DEUNA is a Colombian checkout platform that integrates Nequi natively. Their **public documentation is the best source for Nequi webhook/payload details** because they wrap the native Nequi API and document the raw integration.

- **Docs:** https://docs.deuna.com/docs/nequi-push

### Why it matters for Micelio

- Reference source for webhook payload structure (see Nequi section above)
- Confirms HMAC-SHA384 signature algorithm
- Documents the `Digest` + `Signature` header scheme
- Not a gateway to use — just a docs goldmine

---

## Yuno — Enterprise Orchestrator (Publica.la uses this)

### Overview

Payment orchestrator used by Publica.la for Commerce team. Routes transactions through multiple gateways including Bamboo Payment Colombia for Nequi.

- **Dashboard:** https://dashboard.y.uno
- **Known issues:** See Linear COM-98 (UI errors on successful Nequi payments, QR flow broken)

### Key value

- Single integration, many gateways (Bamboo, MP, Stripe, etc.)
- Production-tested with Nequi via Bamboo Colombia
- Routing configurable per country/method

### Caveat for Micelio

- Enterprise pricing, heavyweight for self-serve SaaS
- Publica.la uses it because of existing contract — not a fit for Micelio's product-led model
- **Lessons:** Known issues with Nequi Push async state handling (COM-98) — frontend not reflecting success after wallet redirect. Apply as warning when implementing own flow: webhook/polling must update UI independently of SDK return.

---

## ePayco (Colombia) — Alternative Aggregator

### Pricing

- 2.99% + $900 COP + IVA
- No setup, no monthly fee

### Notes

Less well-documented than Wompi/PayU. Not evaluated in depth. Listed here for completeness.

- **Docs:** https://epayco.com/recursos-de-desarrollo/

---

## Decision Matrix (for Micelio Colombian expansion)

| Path | Nequi support | Subscriptions | Foreign entity OK | Effort | Recommended for |
|------|---------------|---------------|-------------------|--------|-----------------|
| **Nequi Conecta direct (per tenant)** | Native | Yes (cert'd) | N/A — tenant-level | Medium (wrapper + manual onboarding UX) | **Chosen for SKY-270** — tenants already have Nequi commerce |
| **Wompi** | Native | Yes | Ambiguous | Low | Backup if direct Nequi proves too rigid |
| **PayU** | Yes | Yes | Yes | Medium | Skywalking-level integration for tenants without Nequi |
| **Stripe** | No | Yes | Yes | Low | Global MVP, international tenants |
| **EBANX** | Yes (recurring) | **Yes (native)** | Yes | Medium | When Nequi subscriptions are needed |

---

## Lessons Applied to Micelio

### From COM-98 (Yuno + Bamboo Nequi bug)

**Issue:** UI showed payment error on successful Nequi payments. Content was correctly assigned but checkout UX said failed.

**Root cause hypothesis:** SDK/wallet redirect flow didn't wait for async webhook confirmation. Frontend state machine assumed synchronous completion.

**Application to Micelio Nequi integration:**
- Never rely on SDK return/redirect for final order state
- Frontend must poll `/api/orders/:id/status` or listen to webhook-triggered state
- Show "pending confirmation" explicit state during the polling window
- Only transition to "paid" when webhook/polling confirms `paymentStatus === 'SUCCESS'`

### Pattern from MercadoPago integration (existing, working)

**What to reuse verbatim:**
- `lib/encryption.ts` AES-256-GCM pattern for credentials
- `CheckoutService.execute()` branch-per-method pattern
- Single-query tenant fetch `findBySlugWithToken` → extend to include Nequi creds
- Webhook returns 200 always to prevent retry loops
- `external_reference` = order ID convention

**What must differ for Nequi:**
- Signature algorithm: HMAC-**SHA384** (not SHA256 like MP)
- Signed payload format: `content-type: ...\ndigest: ...` (not MP's `ts.requestId.body`)
- Payment flow is async (push → user approval) vs MP's sync redirect to hosted checkout
- Must show explicit "waiting for user in Nequi app" UI state
- Must handle phone number validation (Colombian format)
- Currency is fixed COP — cannot respect tenant.currency

---

## Open Questions (for future research)

- [ ] Exact request body schema for Nequi `getStatusPayment` polling (not public)
- [ ] Nequi webhook retry policy — how many attempts, backoff interval
- [ ] Nequi push payment expiration time (rumored ~5 min, not confirmed)
- [ ] Does Wompi accept foreign merchants (Skywalking-level)
- [ ] PayU recurring payments — does it work well for SaaS-style subscriptions

---

## Sources

1. https://www.nequi.com.co/negocios/apis — Nequi Conecta portal
2. https://docs.conecta.nequi.com.co/ — Official docs (auth-gated)
3. https://docs.deuna.com/docs/nequi-push — **Best public source for webhook payload**
4. https://docs.ebanx.com/docs/payments/guides/accept-payments/api/colombia/nequi-recurrent — EBANX recurring Nequi
5. https://docs.wompi.co — Wompi docs
6. https://developers.payulatam.com/latam/es/docs/integrations.html — PayU Colombia
7. https://ayuda.negocios.nequi.co/hc/es-419/articles/360046706451 — Nequi certification process
8. https://github.com/nequibc — Nequi official GitHub (minimal content)
9. Linear COM-98 — Real-world Nequi integration issues at Publica.la
10. Skywalking Linear SKY-270 — Current Nequi integration issue

---

*Maintained as part of `/docs` — update when new gateways are evaluated or when Nequi API details change.*
