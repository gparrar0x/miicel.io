import { createClient } from '@supabase/supabase-js'

/**
 * Seed test data for E2E tests
 * Creates owner and non-owner users, tenant, and associated data
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const TEST_TENANT = {
  slug: 'test-store',
  name: 'Test Store',
}

export const TEST_USERS = {
  owner: {
    email: 'owner@test.com',
    password: 'testpass123',
  },
  nonOwner: {
    email: 'nonowner@test.com',
    password: 'testpass123',
  },
}

/**
 * Seed test data into database
 * Creates:
 * - Owner user account
 * - Test tenant
 * - Non-owner user account
 *
 * @returns Object with owner user, tenant, and non-owner user IDs
 */
export async function seedTestData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🌱 Starting test data seed...')

  try {
    // 0. Cleanup stale test data
    console.log(`  Cleaning up stale test data...`)
    try {
      // Delete tenant first (cascade cleanup)
      const { error: tenantDeleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('slug', TEST_TENANT.slug)

      if (tenantDeleteError && !tenantDeleteError.message?.includes('no rows')) {
        console.log(`  ⚠ Tenant cleanup: ${tenantDeleteError.message}`)
      } else {
        console.log(`  ✓ Stale tenant cleaned`)
      }

      // Delete stale auth users with hard delete
      try {
        const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers({ perPage: 100 })
        if (listError) {
          console.log(`  ⚠ Unable to list users: ${listError.message}`)
        } else if (allUsers?.users) {
          for (const user of allUsers.users) {
            if (user.email === TEST_USERS.owner.email || user.email === TEST_USERS.nonOwner.email) {
              const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id, { shouldSoftDelete: false })
              if (deleteError) {
                console.log(`  ⚠ Failed to delete ${user.email}: ${deleteError.message}`)
              } else {
                console.log(`  ✓ Deleted stale user: ${user.email}`)
              }
            }
          }
        }
      } catch (userDeleteError) {
        console.log(`  ⚠ User cleanup error: ${userDeleteError}`)
      }
    } catch (cleanupError) {
      console.log(`  ⚠ Cleanup warning: ${cleanupError}`)
    }

    // 1. Create fresh test data
    console.log(`  Creating owner user: ${TEST_USERS.owner.email}`)
    let tenant
    let owner

    const { data: newOwner, error: ownerError } = await supabase.auth.admin.createUser({
      email: TEST_USERS.owner.email,
      password: TEST_USERS.owner.password,
      email_confirm: true,
    })

    if (newOwner?.user) {
      owner = newOwner.user
      console.log(`  ✓ Owner user created: ${owner.id}`)
    } else {
      throw new Error(`Failed to create owner user: ${ownerError?.message}`)
    }

    // Validate owner has email before tenant creation
    if (!owner.email) {
      throw new Error(`Owner user has no email assigned`)
    }

    // Create tenant
    console.log(`  Creating tenant: ${TEST_TENANT.slug}`)
    const { data: newTenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        slug: TEST_TENANT.slug,
        name: TEST_TENANT.name,
        owner_id: owner.id,
        owner_email: owner.email,
        active: true,
        config: {
          colors: {
            primary: '#3B82F6',
            secondary: '#10B981',
          },
          business_name: TEST_TENANT.name,
        },
      })
      .select()
      .single()

    if (tenantError) {
      throw new Error(`Failed to create tenant: ${tenantError.message}`)
    }

    tenant = newTenant
    console.log(`  ✓ Tenant created: ${tenant.id}`)

    // 2. Create non-owner user
    console.log(`  Creating non-owner user: ${TEST_USERS.nonOwner.email}`)

    const { data: newNonOwner, error: nonOwnerError } = await supabase.auth.admin.createUser({
      email: TEST_USERS.nonOwner.email,
      password: TEST_USERS.nonOwner.password,
      email_confirm: true,
    })

    if (!newNonOwner?.user) {
      throw new Error(`Failed to create non-owner user: ${nonOwnerError?.message}`)
    }

    const nonOwner = newNonOwner.user
    console.log(`  ✓ Non-owner user created: ${nonOwner.id}`)

    console.log('✅ Test data seed completed')

    return {
      owner,
      tenant,
      nonOwner,
    }
  } catch (error) {
    console.error('❌ Seed failed:', error)
    throw error
  }
}

/**
 * Cleanup test data after tests
 * Removes:
 * - Test tenant (cascade deletes related records)
 * - Test users
 *
 * Safe to run multiple times
 */
export async function cleanupTestData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('🧹 Starting test data cleanup...')

  try {
    // 1. Delete tenant (cascade cleanup)
    console.log(`  Deleting tenant: ${TEST_TENANT.slug}`)
    const { error: tenantError } = await supabase
      .from('tenants')
      .delete()
      .eq('slug', TEST_TENANT.slug)

    if (tenantError && !tenantError.message.includes('no rows')) {
      console.warn(`  ⚠ Tenant delete warning: ${tenantError.message}`)
    } else {
      console.log(`  ✓ Tenant deleted`)
    }

    // 2. Delete users
    console.log(`  Deleting test users`)
    const { data: allUsers } = await supabase.auth.admin.listUsers()

    for (const user of allUsers.users) {
      if (user.email === TEST_USERS.owner.email || user.email === TEST_USERS.nonOwner.email) {
        await supabase.auth.admin.deleteUser(user.id)
        console.log(`  ✓ Deleted user: ${user.email}`)
      }
    }

    console.log('✅ Test data cleanup completed')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}
