# 🔍 Análisis Detallado: Botón "Activar Tienda" No Redirecciona

**Fecha:** 2025-01-15
**Status:** 🔴 Bug Confirmado
**Severidad:** Alta - Bloquea flujo principal

---

## 📊 Comportamiento Observado

### Estado del Botón Durante Activación

```yaml
Antes del click:
  - Texto: "Activar Tienda"
  - Estado: enabled
  - Locator: [data-testid="onboarding-activate-button"]

Después del click:
  - Texto: "Activando tienda..."
  - Estado: disabled
  - Icon: Loading spinner visible
  - URL: /signup/{slug}/onboarding  (NO CAMBIA)
```

### Console Logs Capturados

```javascript
[log] ✅ User signed in: f8007708-70cd-42ed-b5e9-a9330164bc19
[log] ✅ Session established: eyJhbGciOiJIUzI1NiIs...
[log] ✅ Onboarding: Session found f8007708-70cd-42ed-b5e9-a9330164bc19
```

**✅ La autenticación funciona correctamente**

### Network Requests (Relevantes)

```http
POST /api/signup/validate-slug → 200 OK
POST /api/signup → 201 Created
POST https://.../auth/v1/token?grant_type=password → 200 OK
GET /signup/{slug}/onboarding?_rsc=6k3yh → 200 OK
```

**🔴 NO HAY REQUEST a `/api/tenants/{slug}/activate` después del click!**

---

## 🎯 Root Cause Analysis

### Hipótesis Confirmada

El botón "Activar" **NO está ejecutando** la llamada API de activación.

**Evidencia:**
1. ✅ El botón cambia a loading state ("Activando tienda...")
2. ✅ El botón se deshabilita correctamente
3. ❌ No hay POST a `/api/tenants/{slug}/activate` en los network logs
4. ❌ No hay redirect a `/{slug}`
5. ❌ La página se queda en loading infinito

### Teoría: Handler del onClick Incompleto

```typescript
// Código actual (supuesto):
const handleActivate = async () => {
  setIsActivating(true)  // ✅ Esto se ejecuta (vemos el loading)

  try {
    // ❌ MISSING: La llamada API nunca se ejecuta
    // await fetch(`/api/tenants/${slug}/activate`, {...})

    // ❌ MISSING: El redirect nunca se ejecuta
    // router.push(`/${slug}`)

  } catch (error) {
    setIsActivating(false)
  }
}
```

### DOM Snapshot en Estado de Failure

```yaml
- button "Activando tienda..." [disabled] [ref=e43]:
    - img [ref=e44]  # Loading spinner
    - text: Activando tienda...

- generic [ref=e42]: tutienda.com/happy-path-1763176811383  # URL correcto generado
```

**Observación importante:**
El componente **SÍ tiene acceso al slug correcto** (`happy-path-1763176811383`), visible en el resumen de la UI.

---

## 🔧 Fix Requerido

### Archivo a Modificar

**Location:** `app/signup/[slug]/onboarding/page.tsx`
**Component:** OnboardingStep5 o similar

### Implementación Sugerida

```typescript
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function OnboardingStep5({ slug }: { slug: string }) {
  const router = useRouter()
  const [isActivating, setIsActivating] = useState(false)

  const handleActivate = async () => {
    setIsActivating(true)

    try {
      console.log('🚀 Starting activation for tenant:', slug)

      // 1. Call activation API
      const response = await fetch(`/api/tenants/${slug}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Include any final onboarding data if needed
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Activation failed')
      }

      const data = await response.json()
      console.log('✅ Tenant activated:', data)

      // 2. Show success message
      toast.success('¡Tienda activada exitosamente!')

      // 3. Wait a moment for user to see the toast
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 4. ✅ CRITICAL: Redirect to storefront
      console.log('🔄 Redirecting to storefront:', `/${slug}`)
      router.push(`/${slug}`)

    } catch (error) {
      console.error('❌ Activation error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error al activar la tienda. Por favor intenta nuevamente.'
      )
      setIsActivating(false)
    }
  }

  return (
    <div>
      {/* ... resto del componente ... */}

      <button
        data-testid="onboarding-activate-button"
        onClick={handleActivate}
        disabled={isActivating}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isActivating ? (
          <>
            <LoadingSpinner />
            Activando tienda...
          </>
        ) : (
          'Activar Tienda'
        )}
      </button>
    </div>
  )
}
```

---

## ✅ Checklist Post-Fix

Después de implementar el fix, verificar:

### En el Código

- [ ] `router.push(\`/${slug}\`)` está presente en el handler
- [ ] Se ejecuta **después** de que la API responda exitosamente
- [ ] Hay manejo de errores con `setIsActivating(false)`
- [ ] Los console.logs están presentes para debugging

### En el Browser (Manual Test)

1. [ ] Abrir DevTools → Network tab
2. [ ] Completar onboarding hasta Step 5
3. [ ] Click en "Activar Tienda"
4. [ ] Verificar que aparece: `POST /api/tenants/{slug}/activate → 200 OK`
5. [ ] Verificar que aparece: `GET /{slug}` (redirect)
6. [ ] Verificar que la URL cambia a `/{slug}`
7. [ ] Verificar que el storefront se carga

### En el E2E Test

```bash
npx playwright test complete-signup-flow.spec.ts:27 --project=chromium
```

**Expected output:**
```
✅ Signup complete! Tenant created: test-slug-123
✅ Onboarding complete!
✅ Storefront is live at: /test-slug-123  ← Esto debe aparecer
✅ Cleaning up test data...

1 passed
```

---

## 📝 API Endpoint Status

### ¿Existe `/api/tenants/[slug]/activate`?

**Verificar con:**
```bash
# Buscar el archivo del endpoint
find app/api -name "*activate*" -type f

# O buscar en rutas
grep -r "activate" app/api/tenants
```

**Si NO existe:** Pixel también necesita crear este endpoint.

**Expected endpoint behavior:**
```typescript
// app/api/tenants/[slug]/activate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = await createServerClient()

  // 1. Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Update tenant status to 'active'
  const { data: tenant, error } = await supabase
    .from('tenants')
    .update({ status: 'active', activated_at: new Date().toISOString() })
    .eq('slug', params.slug)
    .eq('owner_id', user.id)  // Security: only owner can activate
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, tenant })
}
```

---

## 🎬 Video Evidence

**Location:** `tests/test-results/complete-signup-flow-.../video.webm`

El video muestra:
- ✅ Todo el flujo hasta Step 5
- ✅ Click en "Activar Tienda"
- ✅ Botón cambia a "Activando tienda..."
- ❌ Página se queda en loading (no redirect)
- ❌ URL permanece en `/signup/{slug}/onboarding`

---

## 📞 Next Steps

1. **Pixel:** Implementar `router.push()` en el handler del botón "Activar"
2. **Pixel:** Verificar/crear el endpoint `/api/tenants/[slug]/activate`
3. **Pixel:** Verificar que existe la página `app/[slug]/page.tsx` (storefront)
4. **Sentinela:** Re-correr test después del fix
5. **Sentinela:** Verificar que el test pasa completo

---

**Priority:** 🔴 **URGENT** - Sin esto el flujo principal está roto

**Estimated Fix Time:** 15-30 minutos (si el API endpoint ya existe)

**Test Command:**
```bash
npx playwright test complete-signup-flow.spec.ts:27 --project=chromium --headed
```
