# KOKORO: Multi-Tenant Template Backend

**Sprint:** Template System MVP
**Owner:** Kokoro
**Updated:** 2025-01-18

---

## Overview

DB schema for tenant templates + API endpoints for theme config.

---

## Tasks

### 1. DB Schema Migration (Issue #1) - P0

**Goal:** Add tenant template config to tenants table.

**Acceptance Criteria:**
- [ ] Migration adds `template` enum (gallery, detail, minimal) default minimal
- [ ] Migration adds `theme_overrides` JSONB column
- [ ] Validation: overrides match token schema
- [ ] Seed: 3 demo tenants w/ different templates
- [ ] Index on `template` for analytics

**Technical:**
- Schema: `{colors: {primary, accent, bg}, spacing: number[], grid: {cols, gap}}`
- Pydantic schema for validation
- Files: `/migrations/XXXX_tenant_templates.py`, `/models/tenant.py`

**Estimate:** 3h

---

### 2. Theme API Endpoints (Issue #5) - P0

**Goal:** GET/PATCH tenant theme config.

**Acceptance Criteria:**
- [ ] `GET /api/tenants/:id/theme` → {template, tokens, overrides}
- [ ] `PATCH /api/tenants/:id/theme` validates + saves
- [ ] Auth: tenant admin only
- [ ] Validation: Pydantic schema for overrides
- [ ] Cache: Redis 5min TTL
- [ ] Return merged tokens (base + overrides)
- [ ] Emit event for cache invalidation

**Technical:**
- Use `/lib/themes.ts` base configs (coordinate w/ Pixel)
- FastAPI dependency injection for auth
- Files: `/api/routes/tenants.py`, `/api/schemas/theme.py`

**Estimate:** 5h

---

### 3. Admin Middleware

**Goal:** Ensure only tenant admins can modify themes.

**Acceptance Criteria:**
- [ ] Decorator `@require_tenant_admin` checks user role
- [ ] Returns 403 if user not admin of target tenant
- [ ] Logs unauthorized attempts

**Technical:**
- Reuse existing auth middleware
- Files: `/api/middleware/auth.py`

**Estimate:** 2h

---

### 4. Seed Data

**Goal:** Demo tenants for testing.

**Acceptance Criteria:**
- [ ] Tenant A: gallery template, custom accent color
- [ ] Tenant B: detail template, default theme
- [ ] Tenant C: minimal template, custom spacing
- [ ] Seed runs in dev/staging, skips prod

**Technical:**
- Files: `/seeds/demo_tenants.py`

**Estimate:** 1h

---

## Total Estimate: 11h (~1.5 days)

## Blockers

None. Pixel needs token schema from Issue #1 → coordinate on shape.

## Handoff to Pixel

Once Issue #5 complete:
- API endpoints live in dev
- Postman collection or OpenAPI spec shared
- Flag for admin UI integration (Pixel Issue #4)
