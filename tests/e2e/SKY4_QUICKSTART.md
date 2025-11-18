# SKY-4: MercadoPago Checkout Tests - Quick Start

## Setup (1 min)

```bash
# Ensure dependencies installed
npm install

# Copy env example (if needed)
cp .env.e2e.example .env.local

# Add webhook secret to .env.local
echo "MERCADOPAGO_WEBHOOK_SECRET=test-secret-key-for-testing" >> .env.local
```

## Run Tests

### All MercadoPago Tests (T1 + T2)
```bash
npm run test:e2e -- checkout-mercadopago webhook-mercadopago
```

### T1 Only: Checkout E2E (17 tests)
```bash
npm run test:e2e -- checkout-mercadopago
```

### T2 Only: Webhook API (20 tests)
```bash
npm run test:e2e -- webhook-mercadopago
```

### Single Test
```bash
npm run test:e2e -- checkout-mercadopago -g "T1.5"
```

### Debug Mode (Interactive)
```bash
npm run test:e2e:debug -- checkout-mercadopago
```

### UI Mode (Visual Runner)
```bash
npm run test:e2e:ui -- checkout-mercadopago
```

### Headed (See Browser)
```bash
npm run test:e2e:headed -- checkout-mercadopago
```

### Generate Report
```bash
npm run test:e2e -- checkout-mercadopago
npm run test:e2e:report
```

## What's Tested

### T1: MercadoPago Checkout (17 tests)
- Form validation (name, phone, email)
- Happy path checkout flow
- API error handling (500, 400, timeout)
- Success/failure page rendering
- Modal open/close states

### T2: Webhook API (20 tests)
- HMAC-SHA256 signature validation
- Replay attack prevention
- Malformed payload handling
- Rate limiting under load
- Error response formats

## Files

| File | Purpose |
|------|---------|
| `specs/checkout-mercadopago.spec.ts` | E2E checkout tests |
| `specs/webhook-mercadopago.spec.ts` | Webhook API security tests |
| `pages/checkout.page.ts` | Reusable checkout interactions |
| `locators/checkout.locators.ts` | All data-testid definitions |
| `SKY_4_SENTINELA_REPORT.md` | Full coverage report |

## Expected Results

- All tests use mocked MercadoPago (no real API calls)
- Runtime: ~75s for full suite (Chromium only)
- Multi-browser: 185 test runs across all engines
- 0 flaky tests (deterministic data-testid selectors)

## Troubleshooting

**Tests fail on modal not found:**
→ Pixel UI not complete; verify checkout-modal-container data-testid exists

**Webhook tests fail on 404:**
→ Backend `/api/webhooks/mercadopago` route not implemented yet

**Signature validation fails:**
→ Check `MERCADOPAGO_WEBHOOK_SECRET` in .env matches backend

**Port 3000 already in use:**
```bash
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
npm run test:e2e -- ...
```

## Notes

- Tests are blocking on Pixel completing checkout UI
- Page Object provides 30+ reusable methods for future tests
- All selectors use data-testid (zero CSS fragility)
- Webhook tests need real backend route to pass
