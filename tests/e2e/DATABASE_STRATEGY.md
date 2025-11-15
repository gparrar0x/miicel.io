# Database Strategy for E2E Tests

## Overview

This document explains how the E2E test suite manages database state, ensures test isolation, and cleans up after itself.

**Key Principle**: Each test is responsible for cleaning up its own data. This prevents orphaned records and allows tests to run in parallel without conflicts.

## Architecture

```
┌──────────────────────────────────┐
│  Test Execution                  │
│  ├─ Setup                        │
│  ├─ Test Steps                   │
│  ├─ Queue Cleanup                │
│  └─ Execute Cleanup (async)      │
└──────────────────────────────────┘
```

## Data Flow

### 1. Test Data Generation

Each test generates **unique** data to prevent collisions:

```typescript
const testData = generateTestData()
// Result:
// {
//   email: 'e2e-test-1700000000000@example.com',
//   slug: 'store-1700000000000',
//   businessName: 'Test Business 1700000000000',
//   password: 'TestPassword123!',
//   timestamp: 1700000000000
// }
```

**Why timestamps?**
- Guarantees uniqueness across parallel test runs
- Easy to identify test-generated data
- Allows cleanup of orphaned data if needed

### 2. Tenant Creation

When a test creates a tenant via signup:

```typescript
// Supabase Auth creates:
// - auth.users (email, password hash, id, etc.)

// Supabase Database creates:
// - tenants (slug, owner_id, name, config, etc.)
// - Cascade: products, orders, etc.
```

### 3. Cleanup Queueing

After test completes (even if it fails), cleanup is queued:

```typescript
test('my test', async ({ page, dbCleanup }) => {
  // Test runs...
  await dbCleanup({
    tenantSlug: testData.slug,
    userEmail: testData.email
  })
  // Cleanup doesn't run until test exits
})
```

### 4. Cleanup Execution

After test finishes, the fixture executes all queued cleanups:

```
Test Execution Flow:
├─ Test code runs
├─ dbCleanup() called (queues cleanup)
├─ Test ends
├─ Cleanup executes (async)
│  ├─ Delete tenant by slug
│  │  ├─ Find tenant.id from slug
│  │  ├─ Delete from tenants (cascade)
│  │  └─ Delete from products, orders (automatic)
│  ├─ Delete auth user by ID
│  │  └─ Call supabaseAdmin.auth.admin.deleteUser()
│  └─ Delete auth user by email (fallback)
└─ Next test starts
```

## Cleanup Strategy

### Primary Cleanup: By Slug

Most reliable method - uses tenant slug:

```typescript
await dbCleanup({ tenantSlug: 'store-1700000000000' })
```

**Flow:**
1. Query `tenants` table for row with matching slug
2. Extract `tenant.id` and `tenant.owner_id`
3. Delete tenant row (cascades related records)
4. Delete auth user by ID

**Advantages:**
- Single query finds both tenant and user ID
- Cascade delete handles related records automatically
- No email lookup needed (more reliable)

### Fallback Cleanup: By Email

If ID not available, fallback to email:

```typescript
await dbCleanup({ userEmail: 'test@example.com' })
```

**Flow:**
1. Query auth users by email
2. Extract user ID
3. Delete auth user

**Use Case:**
- Test failed before tenant was created
- Only auth user exists, no tenant record

### Manual Cleanup: By User ID

Direct cleanup by user ID:

```typescript
await dbCleanup({ userId: '12345678-1234-...' })
```

**Use Case:**
- Test has explicit user ID but lost slug/email

## Cascade Deletion

PostgreSQL cascade rules ensure related records are deleted:

```sql
-- When tenant is deleted, these cascade:
products -> tenant_id = tenants.id  [DELETE CASCADE]
orders    -> tenant_id = tenants.id [DELETE CASCADE]
customers -> tenant_id = tenants.id [DELETE CASCADE]

-- When auth user is deleted:
-- Supabase automatically cleans up sessions
```

## Preventing Orphaned Records

### What Happens if Cleanup Fails?

1. **Test failure doesn't affect cleanup**
   ```typescript
   test('fails but cleans up', async ({ dbCleanup }) => {
     await dbCleanup({ tenantSlug: 'store-123' })
     throw new Error('Test failed!')  // Cleanup still runs
   })
   ```

2. **Multiple cleanup calls are safe**
   ```typescript
   test('multiple cleanups', async ({ dbCleanup }) => {
     const data1 = generateTestData()
     const data2 = generateTestData()

     // Create both tenants...

     // Queue both cleanups
     await dbCleanup({ tenantSlug: data1.slug })
     await dbCleanup({ tenantSlug: data2.slug })
     // Both will execute after test
   })
   ```

3. **Manual recovery from orphaned data**
   ```bash
   # Option 1: Full reset (careful!)
   npm run db:reset

   # Option 2: Delete specific orphaned records
   supabase db execute "DELETE FROM tenants WHERE slug LIKE 'store-%' AND owner_id IS NULL"
   ```

## Test Isolation

### Parallel Test Execution

Tests can run in parallel because:
1. Each test uses unique slug/email (timestamp-based)
2. No shared test data or state
3. Each test cleans up its own records

```
Test 1: slug = 'store-1700000000000'  │
Test 2: slug = 'store-1700000001000'  │ Run in parallel
Test 3: slug = 'store-1700000002000'  │
```

### No Shared State

```typescript
// BAD: Shared state (don't do this!)
const sharedSlug = 'my-store'  // Same slug every test

test('test 1', async ({ page, dbCleanup }) => {
  // May fail if test 2 already has this slug
})

test('test 2', async ({ page, dbCleanup }) => {
  // May fail if test 1 hasn't cleaned up yet
})
```

```typescript
// GOOD: Unique state (do this!)
const testData = generateTestData()  // Unique slug per test

test('test 1', async ({ page, dbCleanup }) => {
  // Guaranteed unique slug
  await dbCleanup({ tenantSlug: testData.slug })
})

test('test 2', async ({ page, dbCleanup }) => {
  // Different slug, no conflicts
  const testData2 = generateTestData()
  await dbCleanup({ tenantSlug: testData2.slug })
})
```

## Verifying Cleanup Works

### Check if Tenant Was Deleted

```typescript
import { verifyTenantDeleted } from '../fixtures/database.fixture'

test('cleanup verification', async ({ dbCleanup }) => {
  const testData = generateTestData()

  // Create tenant
  const signupPage = new SignupPage(page)
  await signupPage.navigate()
  await signupPage.fillForm(testData)
  await signupPage.submitAndWaitForOnboarding()

  // Queue cleanup
  await dbCleanup({ tenantSlug: testData.slug })

  // Note: Can't verify immediately - cleanup happens after test
  // But you can add this in the next test:
})

test('verify previous test cleaned up', async () => {
  const previousTestSlug = 'store-1700000000000'
  const deleted = await verifyTenantDeleted(previousTestSlug)
  expect(deleted).toBe(true)
})
```

### Check Database Directly

```bash
# Connect to Supabase
supabase db shell

# Check for orphaned tenants
SELECT id, slug, owner_id, created_at FROM tenants
WHERE slug LIKE 'store-%'
ORDER BY created_at DESC;

# Delete orphaned tenants
DELETE FROM tenants
WHERE slug LIKE 'store-%'
AND created_at < NOW() - INTERVAL '1 hour';
```

## Common Issues

### Issue 1: "Slug already taken"

**Symptom**: Test fails because slug is already taken

**Cause**: Previous test didn't clean up (or cleanup failed)

**Solution**:
```typescript
// 1. Check database for orphaned records
supabase db shell
SELECT slug FROM tenants WHERE slug LIKE 'store-%' LIMIT 10;

// 2. Delete orphaned records
DELETE FROM tenants WHERE slug LIKE 'store-%';

// 3. Re-run tests
npm run test:e2e
```

### Issue 2: "User already exists"

**Symptom**: Signup fails with "User already exists"

**Cause**: Auth user wasn't deleted (email already registered)

**Solution**:
```bash
# Delete orphaned auth users
supabase db execute "
  DELETE FROM auth.users
  WHERE email LIKE 'e2e-test-%@example.com'
"

# Or full reset
npm run db:reset
```

### Issue 3: Cleanup Timeout

**Symptom**: Cleanup takes too long (> 10 seconds)

**Cause**: Database is slow, too many records to delete

**Solution**:
```typescript
// Increase global timeout in playwright.config.ts
globalTimeout: 20 * 60 * 1000  // 20 minutes instead of 10
```

### Issue 4: Orphaned Records After Test Failure

**Symptom**: Test fails, database has leftover records

**Cause**: Test error prevented cleanup from queuing

**Solution**:
```typescript
// Make sure cleanup is always called, even on failure:
test('test', async ({ dbCleanup }) => {
  const testData = generateTestData()

  try {
    // Test logic
  } finally {
    // This ensures cleanup runs even if test fails
    await dbCleanup({ tenantSlug: testData.slug })
  }
})
```

## Performance Considerations

### Cleanup Time

- **Per-test cleanup**: ~500ms per tenant
- **Parallel cleanup**: Multiple tests clean up simultaneously
- **Total overhead**: Minimal (<1s for typical test suite)

### Optimization Tips

1. **Cleanup in background** (already done in fixture)
   ```typescript
   // Cleanup runs after test completes, doesn't block next test
   ```

2. **Batch cleanup for multiple tenants**
   ```typescript
   test('cleanup multiple', async ({ dbCleanup }) => {
     await dbCleanup({ tenantSlug: data1.slug })
     await dbCleanup({ tenantSlug: data2.slug })
     // Both cleanup in parallel after test
   })
   ```

3. **Use cascade deletion** (already configured)
   ```sql
   -- Single DELETE cascades to products, orders, etc.
   DELETE FROM tenants WHERE id = 123;
   ```

## Monitoring

### Track Test Data

Monitor test-generated data in Supabase:

```bash
# Count test tenants
supabase db execute "
  SELECT COUNT(*) as test_tenant_count
  FROM tenants
  WHERE slug LIKE 'store-%'
"

# Most recent test tenants
supabase db shell
SELECT slug, owner_id, created_at FROM tenants
WHERE slug LIKE 'store-%'
ORDER BY created_at DESC
LIMIT 10;
```

### Alert on Orphaned Data

Set up monitoring to catch orphaned records:

```bash
# Script to run periodically
#!/bin/bash
ORPHANED=$(supabase db execute "
  SELECT COUNT(*) as count FROM tenants
  WHERE slug LIKE 'store-%'
  AND created_at < NOW() - INTERVAL '30 minutes'
" | head -1)

if [ $ORPHANED -gt 0 ]; then
  echo "WARNING: $ORPHANED orphaned test tenants"
  # Send alert, cleanup, etc.
fi
```

## Future Improvements

1. **Add test tags**
   ```typescript
   test('create tenant', { tag: '@e2e-signup' }, async () => {})
   // Cleanup by tag: DELETE FROM tenants WHERE metadata->>'test_tag' = 'e2e-signup'
   ```

2. **Automatic cleanup on failure**
   ```typescript
   test.afterEach(async ({ dbCleanup }, testInfo) => {
     if (testInfo.status !== 'passed') {
       // Automatically cleanup even if dbCleanup wasn't called
     }
   })
   ```

3. **Cleanup timeout management**
   ```typescript
   // Increase cleanup timeout separately from test timeout
   test.setTimeout({ test: 30000, cleanup: 10000 })
   ```

4. **Database transaction-based cleanup**
   ```typescript
   // Wrap each test in a transaction, rollback on failure
   test.use({
     transactionalCleanup: true
   })
   ```

## References

- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-deleteuserbyid)
- [PostgreSQL CASCADE DELETE](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Database Best Practices](../../docs/database.md)
