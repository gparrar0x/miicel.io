# Fix: MercadoPago no muestra "Volver al sitio" en localhost

## El Problema

MercadoPago **rechaza silenciosamente** las `back_urls` con localhost por seguridad.
Resultado: No aparece botón "Volver al sitio" después de pagar en modo test.

## Soluciones

### 🚀 Solución 1: ngrok (Rápido, recomendado para testing)

```bash
# 1. Instalar ngrok
brew install ngrok
# o descargar de https://ngrok.com/download

# 2. Exponer tu localhost
ngrok http 3000

# Output:
# Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

```bash
# 3. Copiar la URL de ngrok y actualizar .env.local
# Agregar esta línea:
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok-free.app
```

```bash
# 4. Reiniciar Next.js
# Ctrl+C para matar el servidor
npm run dev
```

**Ahora probá:**
- Crear nueva orden (usará URL de ngrok)
- Pagar en MP
- ✅ Debería aparecer "Volver al sitio" y auto-redirect

---

### 🔧 Solución 2: Usar dominios especiales de MP para testing

MP acepta estas URLs especiales en modo test:

```typescript
// En create-preference/route.ts, cambiar:
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// Por:
const baseUrl = isProduction 
  ? process.env.NEXT_PUBLIC_BASE_URL 
  : 'https://www.mercadopago.com.ar/checkout/v1/redirect'  // MP test URL
```

❌ **No recomendado:** Requiere parsear URLs complejas después.

---

### 🌐 Solución 3: Deploy a Vercel (Testing en producción)

```bash
# 1. Deploy rápido
vercel --prod

# 2. Obtener URL (ej: miicel.io-xyz.vercel.app)

# 3. Actualizar .env en Vercel
# Settings → Environment Variables
NEXT_PUBLIC_BASE_URL=https://miicel.io-xyz.vercel.app

# 4. Redeploy
vercel --prod
```

✅ **Mejor opción para QA:** Testing con URLs reales.

---

### 🛠️ Solución 4: Workaround temporal (Solo para dev)

Abrí la consola del browser en la página de pago de MP y ejecutá:

```javascript
// Esto te redirige manualmente
window.location.href = 'http://localhost:3000/es/{TU_TENANT}/checkout/success?payment_id=123456&status=approved&external_reference={ORDER_ID}'
```

Reemplazá:
- `{TU_TENANT}` con el slug del tenant
- `{ORDER_ID}` con el ID de la orden que pagaste

❌ **No recomendado:** Solo para verificar que la página success funcione.

---

## Recomendación: Usar ngrok

**Pasos completos:**

```bash
# Terminal 1: ngrok
ngrok http 3000

# Copiar URL: https://abc123.ngrok-free.app
```

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok-free.app
```

```bash
# Terminal 2: Next.js
npm run dev
```

**Testeá:**
1. Ir a `https://abc123.ngrok-free.app/es/{tenant-slug}`
2. Agregar productos al carrito
3. Checkout → MercadoPago
4. Pagar con tarjeta de prueba
5. ✅ Auto-redirect debería funcionar

---

## Verificar que funciona

En los logs del servidor (terminal donde corre `npm run dev`), deberías ver:

```
Creating MP preference with data: {
  "back_urls": {
    "success": "https://abc123.ngrok-free.app/es/mitienda/checkout/success",
    ...
  },
  "auto_return": "approved"  ← Esto solo aparece con ngrok/producción
}
```

**Si ves `auto_return: "approved"`** → ✅ MP lo aceptará y hará redirect automático.

---

## Tarjetas de prueba MP

Para testear en modo sandbox:

```
APROBADA:
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25

RECHAZADA:
Número: 5031 4332 1540 6351
CVV: 123
Fecha: 11/25
```

---

¿Querés que te ayude a configurar ngrok?

