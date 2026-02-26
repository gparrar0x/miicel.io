/**
 * Database Cleanup Fixture
 *
 * Handles automatic cleanup of test data after each test.
 * Uses Supabase Admin Client (service role) to bypass RLS and delete test records.
 *
 * CRITICAL: Each test must cleanup its own tenant and user to prevent orphaned records.
 *
 * Usage in tests:
 * test('my test', async ({ page, dbCleanup }) => {
 *   // Test runs
 *   // After test: dbCleanup({ tenantSlug: 'store-123', userEmail: 'test@example.com' })
 * })
 */

import { test as base } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../types/supabase'

/**
 * Initialize Supabase Admin Client for database operations
 * Uses service role key to bypass Row Level Security (RLS)
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase credentials in environment variables. Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY',
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

interface CleanupParams {
  tenantSlug?: string
  userEmail?: string
  userId?: string
}

/**
 * Database cleanup function
 * Deletes both tenant and auth user records
 *
 * @param params - Cleanup parameters (at least one identifier required)
 */
async function cleanupDatabase(params: CleanupParams): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin()

  // Track what we deleted for logging
  const deleted: string[] = []

  try {
    // Delete tenant by slug
    if (params.tenantSlug) {
      const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('id, owner_id')
        .eq('slug', params.tenantSlug)
        .single()

      if (tenant) {
        // Delete tenant (this will cascade delete related records)
        await supabaseAdmin.from('tenants').delete().eq('id', tenant.id)

        deleted.push(`Tenant '${params.tenantSlug}'`)

        // Delete auth user if we found the owner
        if (tenant.owner_id) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(tenant.owner_id)
            deleted.push(`Auth user '${tenant.owner_id}'`)
          } catch (authError) {
            console.warn(`Failed to delete auth user ${tenant.owner_id}:`, authError)
          }
        }
      }
    }

    // Delete auth user by email (if not already deleted)
    if (params.userEmail) {
      try {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers()

        const userToDelete = users?.users.find((u) => u.email === params.userEmail)
        if (userToDelete) {
          await supabaseAdmin.auth.admin.deleteUser(userToDelete.id)
          deleted.push(`Auth user '${params.userEmail}'`)
        }
      } catch (error) {
        console.warn(`Failed to delete user ${params.userEmail}:`, error)
      }
    }

    // Delete auth user by ID (direct method)
    if (params.userId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(params.userId)
        deleted.push(`Auth user '${params.userId}'`)
      } catch (error) {
        console.warn(`Failed to delete user ${params.userId}:`, error)
      }
    }

    // Log what was cleaned up
    if (deleted.length > 0) {
      console.log(`Database cleanup: ${deleted.join(', ')}`)
    }
  } catch (error) {
    console.error('Database cleanup failed:', error)
    throw error
  }
}

/**
 * Create test fixture with database cleanup capability
 *
 * Extends Playwright test with a dbCleanup function that automatically
 * cleans up test data after the test completes (even if it fails)
 */
export const test = base.extend<{
  dbCleanup: (params: CleanupParams) => Promise<void>
}>({
  // Provide dbCleanup function to tests
  dbCleanup: async ({}, use) => {
    const cleanupQueue: CleanupParams[] = []

    // Pass cleanup function to test
    await use(async (params: CleanupParams) => {
      // Queue cleanup to run after test
      cleanupQueue.push(params)
    })

    // Run all queued cleanups after test completes
    for (const params of cleanupQueue) {
      await cleanupDatabase(params)
    }
  },
})

/**
 * Helper function to verify database state
 * Useful for assertions in tests
 */
export async function verifyTenantExists(slug: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()

  const { data } = await supabaseAdmin.from('tenants').select('id').eq('slug', slug).single()

  return !!data
}

/**
 * Helper function to verify tenant was deleted
 */
export async function verifyTenantDeleted(slug: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin.from('tenants').select('id').eq('slug', slug).single()

  // PGRST116 = no rows returned (which is what we want for deleted state)
  return !data && error?.code === 'PGRST116'
}

/**
 * Export the test object for use in test files
 */
export { expect } from '@playwright/test'
