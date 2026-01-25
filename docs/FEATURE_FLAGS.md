# Feature Flags System

> Technical documentation for miicel.io feature flags
> Last updated: 2025-01-24

## Overview

DB-driven feature flags with support for:
- Global on/off toggles
- Template-based targeting (gallery, gastronomy)
- Tenant-specific allowlists
- User allowlists
- Percentage rollouts
- Environment filtering

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Server Component│────▶│   lib/flags.ts   │────▶│    Supabase     │
│  or API Route    │     │   (1-min cache)  │     │  feature_flags  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
┌─────────────────┐     ┌──────────────────┐
│ Client Component│────▶│  /api/flags      │
│                 │     │  (REST endpoint) │
└─────────────────┘     └──────────────────┘
        │
        ▼
┌──────────────────┐
│ useFeatureFlag() │
│  (30s cache)     │
└──────────────────┘
```

## Database Schema

```sql
CREATE TABLE feature_flags (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key text NOT NULL UNIQUE,
  description text,
  enabled boolean NOT NULL DEFAULT false,
  rules jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### Rules Schema

```typescript
interface FeatureFlagRules {
  templates?: string[]    // ['gallery', 'gastronomy']
  tenants?: number[]      // [1, 2, 3]
  users?: string[]        // ['user-uuid-1', 'user-uuid-2']
  percentage?: number     // 0-100
  environments?: string[] // ['production', 'development']
}
```

## Evaluation Logic

Flags are evaluated in this order:

1. **Global check**: `enabled` must be `true`
2. **Environment filter**: If `rules.environments` exists, current env must match
3. **No targeting**: If no rules defined, flag is enabled for all
4. **Template match**: If `rules.templates` exists and `tenantTemplate` matches → enabled
5. **Tenant match**: If `rules.tenants` exists and `tenantId` is in list → enabled
6. **User match**: If `rules.users` exists and `userId` is in list → enabled
7. **Percentage rollout**: Deterministic hash check based on identifier
8. **Default**: If targeting exists but no match → disabled

## Usage

### Server Components

```tsx
import { isEnabled, Flags } from '@/lib/flags'

export default async function Page({ params }) {
  const showFeature = await isEnabled(Flags.CONSIGNMENTS, {
    tenantId: 1,
    tenantTemplate: 'gallery'
  })

  return showFeature ? <NewFeature /> : <Fallback />
}
```

### Client Components

```tsx
'use client'
import { useFeatureFlag } from '@/lib/hooks/useFeatureFlag'

export function MyComponent({ tenantId }) {
  const { enabled, loading } = useFeatureFlag('new_checkout', { tenantId })

  if (loading) return <Skeleton />
  return enabled ? <NewCheckout /> : <OldCheckout />
}
```

### API Routes

```tsx
import { isEnabled } from '@/lib/flags'

export async function GET() {
  if (await isEnabled('analytics_v2')) {
    return Response.json({ version: 2 })
  }
  return Response.json({ version: 1 })
}
```

## Current Flags

| Key | Description | Enabled | Rules |
|-----|-------------|---------|-------|
| `consignments` | Artwork consignment management | ✅ | `{"templates": ["gallery"]}` |
| `kitchen_view` | Kitchen order view | ✅ | `{"templates": ["gastronomy"]}` |
| `new_checkout` | New checkout flow | ❌ | `{}` |
| `dark_mode` | Dark mode theme | ❌ | `{}` |
| `analytics_v2` | New analytics dashboard | ❌ | `{"percentage": 10}` |

## Integration Points

### Dashboard Navigation (`layout.tsx`)

```tsx
const flagContext = { tenantId: tenant.id, tenantTemplate: tenant.template }
const showConsignments = await isEnabled(Flags.CONSIGNMENTS, flagContext)

const navItems = [
  // ... other items
  ...(showConsignments ? [{ name: 'Consignaciones', href: '...', icon: 'consignments' }] : []),
]
```

### Route Protection (`consignments/page.tsx`)

```tsx
const canAccess = await isEnabled(Flags.CONSIGNMENTS, {
  tenantId: tenant.id,
  tenantTemplate: tenant.template
})

if (!canAccess) {
  notFound()
}
```

### Conditional UI (`AdminOrdersClient.tsx`)

```tsx
// Props from server
interface Props {
  showKitchenView?: boolean
}

// Default view mode based on flag
const [viewMode, setViewMode] = useState(showKitchenView ? 'kitchen' : 'table')

// Conditional toggle
{showKitchenView && <ViewModeToggle />}
```

## API Endpoints

### Single Flag Check

```
GET /api/flags?key=consignments&tenantId=1

Response:
{
  "enabled": true,
  "flag": {
    "key": "consignments",
    "description": "Artwork consignment management"
  }
}
```

### Batch Flag Check

```
GET /api/flags/batch?keys=consignments&keys=kitchen_view&tenantId=1

Response:
{
  "flags": {
    "consignments": true,
    "kitchen_view": false
  }
}
```

## Cache Behavior

| Layer | TTL | Clear Method |
|-------|-----|--------------|
| Server (lib/flags.ts) | 60s | `clearFlagCache(key?)` |
| Client (useFeatureFlag) | 30s | `clearClientFlagCache()` |

## Managing Flags

### Enable a flag globally

```sql
UPDATE feature_flags SET enabled = true WHERE key = 'dark_mode';
```

### Add template targeting

```sql
UPDATE feature_flags
SET rules = '{"templates": ["gallery", "gastronomy"]}'
WHERE key = 'consignments';
```

### Add tenant override (specific tenant gets access regardless of template)

```sql
UPDATE feature_flags
SET rules = '{"templates": ["gallery"], "tenants": [5]}'
WHERE key = 'consignments';
```

### Percentage rollout

```sql
UPDATE feature_flags
SET enabled = true, rules = '{"percentage": 25}'
WHERE key = 'new_checkout';
```

### Environment-specific

```sql
UPDATE feature_flags
SET rules = '{"environments": ["development"]}'
WHERE key = 'debug_mode';
```

### Create new flag

```sql
INSERT INTO feature_flags (key, description, enabled, rules) VALUES
  ('my_feature', 'Description here', false, '{}');
```

## Best Practices

1. **Always provide context**: Pass `tenantId` and `tenantTemplate` when available
2. **Protect routes**: Use `notFound()` for unauthorized access, not just hide UI
3. **Default to disabled**: New flags should be `enabled: false` until ready
4. **Use Flags constant**: Import from `lib/flags.ts` for type safety
5. **Clear cache after updates**: Call `clearFlagCache()` when modifying flags via API

## Files

```
lib/
├── flags.ts                    # Server-side helpers
└── hooks/
    └── useFeatureFlag.ts       # Client-side hook

app/api/flags/
├── route.ts                    # Single flag endpoint
└── batch/route.ts              # Batch flags endpoint

types/
└── database.types.ts           # Includes feature_flags table
```

## RLS Policies

- **Read**: All users can read flags (public config)
- **Write**: Only service_role can modify flags

```sql
CREATE POLICY "feature_flags_read_all" ON feature_flags
  FOR SELECT USING (true);

CREATE POLICY "feature_flags_admin_write" ON feature_flags
  FOR ALL USING (auth.role() = 'service_role');
```
