# 🐛 Debug Report: Onboarding Activation Redirect Issue

**Fecha:** 2025-01-15
**Reporter:** Sentinela (E2E Test Agent)
**Para:** Pixel (Frontend Specialist)
**Prioridad:** 🔴 Alta - Bloquea happy path test completo

---

## 📋 Resumen Ejecutivo

El flujo de onboarding completa **exitosamente los 5 pasos** pero **NO redirecciona** al storefront del tenant después de hacer click en "Activar" en el Step 5.

**Estado Actual:** Página se queda en `/signup/{slug}/onboarding`
**Estado Esperado:** Debería redirigir a `/{slug}` (storefront del tenant)

---

## ✅ Lo Que Funciona

1. ✅ Signup form validation y submit
2. ✅ Tenant creation en base de datos
3. ✅ Redirect de signup → onboarding
4. ✅ Step 1: Logo upload
5. ✅ Step 2: Color selection (continue button activo)
6. ✅ Step 3: Product creation
7. ✅ Step 4: Preview rendering
8. ✅ Step 5: Botón "Activar" es visible y clickeable

---

## ❌ El Problema

### URL Pattern Issue

```
Test execution:
1. User completes onboarding → clicks "Activar"
2. Button click registers successfully
3. Page waits for URL pattern: /^\/[a-z0-9-]+$/
4. Timeout after 10 seconds
5. URL permanece: /signup/happy-path-1763176811383/onboarding
6. Expected URL: /happy-path-1763176811383
```

### Error del Test

```typescript
Error: expect(received).toBe(expected) // Object.is equality

Expected: "happy-path-1763176811383"
Received: "onboarding"

at tests/e2e/specs/complete-signup-flow.spec.ts:105:28
```

---

## 🔍 Artifacts de Debugging

### 1. Trace Viewer (RECOMENDADO 👈)

El trace contiene **TODO** el contexto de ejecución:
- Timeline completo de acciones
- Network requests
- DOM snapshots en cada paso
- Console logs
- Screenshots automáticos

**Cómo verlo:**
```bash
npx playwright show-trace test-results/complete-signup-flow-Compl-6ae4c-oarding-→-active-storefront-chromium/trace.zip
```

### 2. Video Recording

**Ubicación:**
```
test-results/complete-signup-flow-Compl-6ae4c-oarding-→-active-storefront-chromium/video.webm
```

Muestra visualmente todo el flujo hasta el failure.

### 3. Screenshot del Failure

**Ubicación:**
```
test-results/complete-signup-flow-Compl-6ae4c-oarding-→-active-storefront-chromium/test-failed-1.png
```

Captura exacta del estado de la página cuando falló.

### 4. HTML Report Interactivo

**Acceder:**
```bash
npx playwright show-report
```

Incluye:
- Timeline visual
- Todos los attachments
- Logs organizados
- Comparación expected vs actual

---

## 🎯 Ubicación del Código Problemático

### Componente a Revisar

**Archivo:** `app/signup/[slug]/onboarding/page.tsx`

**Buscar:** Step 5 - Botón "Activar" (data-testid="onboarding-activate-button")

### Comportamiento Esperado

```typescript
const handleActivate = async () => {
  try {
    // 1. Guardar configuración final
    await saveOnboardingData()

    // 2. Marcar tenant como activo
    await activateTenant()

    // 3. ⚠️ MISSING: Redirect al storefront
    router.push(`/${slug}`)  // ← Esto probablemente falta

  } catch (error) {
    toast.error('Error al activar tienda')
  }
}
```

### Locator Usado en Test

```typescript
// tests/e2e/locators/onboarding.locators.ts
activateButton: '[data-testid="onboarding-activate-button"]'

// tests/e2e/pages/onboarding.page.ts
async activateStore(): Promise<StorefrontPage> {
  const activateButton = this.page.locator(OnboardingLocators.step5.activateButton)
  await expect(activateButton).toBeEnabled()
  await activateButton.click()

  // Espera redirect a /{slug}
  await this.page.waitForURL(/\/[a-z0-9-]+$/, {
    timeout: 10000 // 10 segundos
  })

  return new StorefrontPage(this.page)
}
```

---

## 🔧 Posibles Causas

### Hipótesis 1: Falta router.push()
El botón ejecuta la lógica de activación pero nunca llama a `router.push()` o `window.location.href`.

### Hipótesis 2: Async/Await Issue
El redirect se ejecuta antes de que termine la operación async de activación.

### Hipótesis 3: Error Silencioso
Hay un error en el handler del botón que impide llegar al redirect.

### Hipótesis 4: Validación Bloqueando
Alguna validación impide que el redirect se ejecute (ej: productos vacíos, aunque el test sí los agrega).

---

## 📊 Network Requests (Para Verificar)

### Requests Esperados en Step 5

```
POST /api/tenants/{slug}/activate
Status: 200 OK
Response: { success: true, tenant: {...} }

→ Luego debería seguir:
GET /{slug}  (storefront page)
```

**Verificar en el trace si:**
- El POST a `/activate` se completa exitosamente
- Hay algún error 4xx/5xx después del click
- El redirect GET nunca se ejecuta

---

## 🛠️ Fix Sugerido

### Archivo: `app/signup/[slug]/onboarding/page.tsx` (o componente del Step 5)

```typescript
import { useRouter } from 'next/navigation'

export function OnboardingStep5({ slug }: { slug: string }) {
  const router = useRouter()
  const [isActivating, setIsActivating] = useState(false)

  const handleActivate = async () => {
    setIsActivating(true)

    try {
      // 1. Guardar configuración final
      const response = await fetch(`/api/tenants/${slug}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* onboarding data */ })
      })

      if (!response.ok) {
        throw new Error('Activation failed')
      }

      // 2. Success toast
      toast.success('¡Tienda activada exitosamente!')

      // 3. ✅ Redirect al storefront
      router.push(`/${slug}`)

    } catch (error) {
      console.error('Activation error:', error)
      toast.error('Error al activar la tienda')
      setIsActivating(false)
    }
  }

  return (
    <button
      data-testid="onboarding-activate-button"
      onClick={handleActivate}
      disabled={isActivating}
    >
      {isActivating ? 'Activando...' : 'Activar Tienda'}
    </button>
  )
}
```

---

## ✅ Checklist de Verificación

Después de implementar el fix, verificar:

- [ ] El botón "Activar" ejecuta `router.push(\`/${slug}\`)`
- [ ] El redirect se ejecuta **después** de que el POST `/activate` termine exitosamente
- [ ] El loading state previene clicks múltiples
- [ ] El toast de éxito se muestra antes del redirect
- [ ] El storefront page existe en `app/[slug]/page.tsx`
- [ ] No hay errores en la consola durante el redirect

---

## 🧪 Cómo Re-testear

```bash
# Opción 1: Run completo
npm run test:e2e

# Opción 2: Solo este test
npx playwright test complete-signup-flow.spec.ts:27 --project=chromium

# Opción 3: Con UI interactiva (recomendado durante desarrollo)
npm run test:e2e:ui
```

**Test exitoso cuando:**
```
✅ Signup complete! Tenant created: test-slug-123
✅ Onboarding complete!
✅ Storefront is live at: /test-slug-123  ← Esto debe aparecer
✅ Cleaning up test data...
```

---

## 📞 Contacto

**Dudas sobre los locators o tests?**
→ Ping @Sentinela en el canal #qa-automation

**Necesitas más context del trace?**
→ Abre el trace viewer y comparte screenshot del timeline

---

## 📎 Links Rápidos

- [Trace Viewer](test-results/complete-signup-flow-Compl-6ae4c-oarding-→-active-storefront-chromium/trace.zip)
- [Video Recording](test-results/complete-signup-flow-Compl-6ae4c-oarding-→-active-storefront-chromium/video.webm)
- [Screenshot](test-results/complete-signup-flow-Compl-6ae4c-oarding-→-active-storefront-chromium/test-failed-1.png)
- [Test Spec](tests/e2e/specs/complete-signup-flow.spec.ts)
- [Onboarding Page Object](tests/e2e/pages/onboarding.page.ts)

---

**Estado:** 🔴 Bloqueado - Requiere fix en frontend
**Next Steps:** Pixel implementa redirect → Sentinela re-corre test → ✅ Happy path completo
