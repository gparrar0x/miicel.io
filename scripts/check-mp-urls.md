# Debug MercadoPago Redirect Issue

## Current Status
- Environment: `localhost:3000`
- Expected behavior: Manual "Volver al sitio" button should work
- Actual behavior: Not redirecting

## Debugging Steps

### 1. Check server logs for MP preference creation
Look for this log in your terminal where Next.js is running:
```
Creating MP preference with data: {
  "items": [...],
  "back_urls": {
    "success": "http://localhost:3000/es/{tenantId}/checkout/success",
    "failure": "...",
    "pending": "..."
  },
  ...
}
```

**Verify:**
- ✅ URLs include `/es/` locale
- ✅ `{tenantId}` is replaced with actual slug
- ✅ No `auto_return` field (since we're in localhost)

### 2. After payment, check MP confirmation screen
- Look for "Volver al sitio" or "Return to site" button
- Click it manually (auto_return doesn't work in localhost)

### 3. Check the URL MP is redirecting to
When you click "Volver al sitio", MP should redirect to:
```
http://localhost:3000/es/{tenantId}/checkout/success?collection_id=XXX&...
```

**Common issues:**
- ❌ Missing `/es/` → 404
- ❌ Wrong tenantId → Not found
- ❌ No query params → Can't fetch order data

### 4. Check browser console
If the redirect happens but page is broken:
- Open DevTools Console (F12)
- Look for errors (red messages)
- Check Network tab for failed requests

## Solutions by Issue

### Issue: "Volver al sitio" button doesn't appear
**Cause:** MP didn't receive back_urls
**Fix:** Verify server logs show back_urls in preference creation

### Issue: Button redirects to wrong URL
**Cause:** NEXT_PUBLIC_BASE_URL not set correctly
**Fix:** Set in `.env.local`:
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```
Restart server: `npm run dev`

### Issue: Redirects but page 404
**Cause:** Missing locale in URL
**Status:** ✅ Fixed in latest code (added `/es/`)

### Issue: Want auto-redirect (no manual click)
**Solution:** Deploy to production domain
- MP blocks `auto_return` on localhost
- Works on real domains (e.g., vercel.app, custom domain)

## Test in Production

To test auto_return behavior without deploying:
1. Use ngrok to expose localhost:
   ```bash
   ngrok http 3000
   ```
2. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
   ```
3. Restart server
4. Create new order (preference will use ngrok URL)
5. auto_return should work now

## Next Steps

Run this command and paste the output:
```bash
# Create a test order and check the logs
# Look for "Creating MP preference with data:"
```

Then tell me:
1. ¿Ves el log con las back_urls?
2. ¿Qué URL aparece en back_urls.success?
3. ¿Aparece el botón "Volver al sitio" en MP después de pagar?
4. ¿A qué URL te redirige cuando hacés clic?

