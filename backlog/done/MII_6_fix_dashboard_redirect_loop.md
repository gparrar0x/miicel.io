---
id: MII_6
project_code: MII
project: miicel.io
title: "MII_6: Fix dashboard redirect loop after login"
estado: done
completed_at: 2025-12-05
tags:
  - bug
  - auth
  - critical
created_at: 2025-12-04
---

## Description

El dashboard admin (`/[locale]/[tenantId]/dashboard`) tiene un redirect loop infinito (ERR_TOO_MANY_REDIRECTS) después de login exitoso. El login funciona correctamente y genera el redirect URL correcto (`/en/3/dashboard`), pero al cargar el dashboard se produce un loop infinito de redirects que impide acceder a la página.

## Context

**Situación actual:**
- Sistema de usuarios implementado con tabla `users` (roles: platform_admin, tenant_admin, staff)
- Login funciona: auth exitoso, cookies Supabase establecidas, redirect URL generado correctamente
- Console log muestra: `Login successful: {user: Object, redirectTo: /en/3/dashboard}`
- Pero dashboard inmediatamente entra en redirect loop

**Trabajo realizado en esta sesión:**
1. ✅ Implementado sistema usuarios con migraciones 031-034
2. ✅ Creados usuarios admin: `admin@miicel.io` (platform_admin), `tenant@miicel.io` (tenant_admin para tenant 3)
3. ✅ Login redirect corregido para usar numeric tenant ID en URL
4. ✅ Dashboard queries actualizados de `.eq('slug', tenantId)` a `.eq('id', parseInt(tenantId))`
5. ❌ useEffect dependencies corregidas (`[tenantId, locale]`) pero problema persiste
6. ❌ Auth check temporalmente deshabilitado para debug pero problema persiste

## Problem / Need

**Síntomas:**
- Login exitoso → redirect a `/en/3/dashboard` → ERR_TOO_MANY_REDIRECTS
- Acceder dashboard directamente también produce redirect loop
- Loop ocurre incluso SIN auth check en useEffect (comentado para debug)
- Browser Chrome da error "redirected you too many times"

**Teorías descartadas:**
- ❌ NO es por useEffect dependencies (corregido, problema persiste)
- ❌ NO es por auth check (deshabilitado, problema persiste)
- ❌ NO es por query usando slug vs ID (corregido, problema persiste)
- ❌ NO es problema de cookies Supabase (login funciona, console log confirma user)

**Hipótesis actual:**
El problema parece estar en `window.location.href` usado en login (línea 47 de `app/[locale]/login/page.tsx`). Este hard redirect puede estar causando que:
1. Login usa `window.location.href = returnUrl` (hard refresh)
2. Dashboard carga con useEffect
3. Algo en el ciclo de renderizado causa otro redirect
4. Loop infinito

## Objective

Identificar y eliminar la causa del redirect loop para que usuarios autenticados puedan acceder al dashboard admin sin errores.

## Success Metric

- Usuario `tenant@miicel.io` puede hacer login
- Dashboard carga correctamente en `/en/3/dashboard`
- No hay ERR_TOO_MANY_REDIRECTS
- Dashboard muestra stats del tenant (productos, órdenes, revenue)

## Current State

**Archivos modificados:**
- `app/[locale]/[tenantId]/dashboard/page.tsx`:
  - Auth check comentado temporalmente (líneas 33-38)
  - useEffect dependencies: `[tenantId, locale]`
  - Query usa `parseInt(tenantId)` en lugar de slug

- `app/[locale]/login/page.tsx`:
  - Usa client-side Supabase auth
  - Llama `/api/auth/login-redirect` para obtener redirect URL
  - Usa `window.location.href` para hard redirect (POSIBLE CAUSA)

- `app/api/auth/login-redirect/route.ts`:
  - Creado para separar lógica de redirect
  - Consulta `users` table con service role
  - Genera redirect basado en role: platform_admin → `/en`, tenant_admin → `/en/{tenant_id}/dashboard`

**Usuarios creados:**
- `admin@miicel.io` / `Admin123!` → platform_admin, tenant_id: null
- `tenant@miicel.io` / `Tenant123!` → tenant_admin, tenant_id: 3

**Deploy actual:**
- URL: `https://micelio-rcb48lkwt-gparrar-3019s-projects.vercel.app`
- Sin auth check (debug mode)
- Problema persiste

## Next Steps

- [x] **Root cause fixed (2025-12-04, commits ecacac2 / ca9acc6):** proxy resolves tenant by slug or ID and preserves locale, breaking the redirect loop.
- [x] Replaced hard `window.location.href` with server-side proxy redirect; dashboard loads correctly for tenant_admin and platform_admin.
- [x] Verified Supabase cookies and dashboard auth check; loop no longer reproducible.

## Outcome

- Dashboard accessible at `/en/3/dashboard` for `tenant@miicel.io`; no `ERR_TOO_MANY_REDIRECTS`.
- Roles validated against `users` table in proxy before dashboard access.
- Regression risk low; tracked in `CHANGELOG.md` under Unreleased → Fixed.

## References

- Login flow: `app/[locale]/login/page.tsx`
- Dashboard: `app/[locale]/[tenantId]/dashboard/page.tsx`
- API redirect: `app/api/auth/login-redirect/route.ts`
- Users migration: `db/supabase/migrations/032_create_users_table.sql`
- Create admin script: `scripts/create-admin.js`

## Debug Info

**Console logs de último test:**
```
Login successful: {user: Object, redirectTo: /en/3/dashboard}
```

**Browser error:**
```
ERR_TOO_MANY_REDIRECTS
micelio-rcb48lkwt-gparrar-3019s-projects.vercel.app redirected you too many times.
```

**Auth check status:** Temporalmente deshabilitado (comentado líneas 33-38 en dashboard page.tsx)

**Deploy con cambios:** `https://micelio-rcb48lkwt-gparrar-3019s-projects.vercel.app`
