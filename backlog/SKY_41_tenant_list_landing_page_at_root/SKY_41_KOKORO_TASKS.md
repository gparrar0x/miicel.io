# Kokoro Tasks - Tenant List API

## SKY-41: Tenants List Endpoint

**Scope**: Public API to fetch active tenants

### Requirements
- Route: `GET /api/tenants/list`
- Query: all active tenants from Supabase
- Return: `{slug, name, logo, status}[]`
- No auth required (public)
- Error handling

### Implementation
Create `app/api/tenants/list/route.ts`:
- Use Supabase client
- Filter: `status = 'active'`
- Select minimal fields
- Return JSON array
- Handle DB errors

### Dependencies
None - independent task

### Estimate
2h

### Testing
Verify with `curl localhost:3000/api/tenants/list` returns tenant array.

---

## Status: COMPLETE ✓

### Delivered
- Route: `/app/api/tenants/list/route.ts`
- Returns active tenants: `{slug, name, logo, status}[]`
- Logo from `config.logo` JSONB field
- Error handling + logging
- Unit tests: `route.test.ts`

### Test Results
```bash
curl http://localhost:3000/api/tenants/list
# Returns 7 active tenants, HTTP 200
# Logo field correctly extracted (sky tenant verified)
```

### Files Created
- `/app/api/tenants/list/route.ts` (66 lines)
- `/app/api/tenants/list/route.test.ts` (48 lines)
- Updated: `CHANGELOG.md`
