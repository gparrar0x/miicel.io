import { createClient } from '@supabase/supabase-js'

/**
 * Seed test data for E2E tests
 * Creates owner and non-owner users, tenant, and associated data
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const TEST_TENANT = {
  slug: 'demo_galeria',
  name: 'Demo Galería',
  id: 1, // Use existing demo tenant
}

export const TEST_TENANT_2 = {
  slug: 'demo_restaurant',
  name: 'Demo Restaurant',
  id: 2, // Use existing demo tenant
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
    // Note: Skipping pre-seed cleanup. Seed is now idempotent (reuses existing users/tenant).
    // This avoids hard delete failures that cause seed to crash on retry.

    // 1. Get or create owner user (idempotent)
    console.log(`  Getting or creating owner user: ${TEST_USERS.owner.email}`)
    let tenant
    let owner

    // Try to find existing owner user
    const { data: allUsersData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 100 })
    const existingOwner = allUsersData?.users?.find(u => u.email === TEST_USERS.owner.email)

    if (existingOwner) {
      owner = existingOwner
      console.log(`  ✓ Using existing owner user: ${owner.id}`)
    } else {
      // Create new owner user if not found
      const { data: newOwner, error: ownerError } = await supabase.auth.admin.createUser({
        email: TEST_USERS.owner.email,
        password: TEST_USERS.owner.password,
        email_confirm: true,
      })

      if (newOwner?.user) {
        owner = newOwner.user
        console.log(`  ✓ Owner user created: ${owner.id}`)
      } else if (ownerError?.message?.includes('already been registered')) {
        // User exists but wasn't found by listUsers (API pagination/permissions issue)
        // Try to sign in to get the user object
        console.log(`  ⚠ User exists but not in initial list, trying sign-in...`)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: TEST_USERS.owner.email,
          password: TEST_USERS.owner.password,
        })

        if (signInData?.user) {
          owner = signInData.user
          console.log(`  ✓ Retrieved owner user via sign-in: ${owner.id}`)
          // Sign out to clean up session
          await supabase.auth.signOut()
        } else {
          throw new Error(`Owner user exists but could not be retrieved. Error: ${signInError?.message || 'Unknown'}. Manual cleanup required: delete user ${TEST_USERS.owner.email} from Supabase auth.`)
        }
      } else {
        throw new Error(`Failed to create owner user: ${ownerError?.message}`)
      }
    }

    // Validate owner has email before tenant creation
    if (!owner.email) {
      throw new Error(`Owner user has no email assigned`)
    }

    // Use existing demo tenant (ID 1)
    console.log(`  Using existing demo tenant: ${TEST_TENANT.slug} (ID ${TEST_TENANT.id})`)
    const { data: existingTenant, error: tenantFetchError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', TEST_TENANT.id)
      .single()

    if (!existingTenant) {
      throw new Error(`Demo tenant ${TEST_TENANT.slug} (ID ${TEST_TENANT.id}) not found in database`)
    }

    // Update BOTH demo tenants owner to test user (for admin access)
    console.log(`  Updating owners for demo tenants...`)
    const { error: updateError1 } = await supabase
      .from('tenants')
      .update({
        owner_email: owner.email,
        owner_id: owner.id,
      })
      .eq('id', TEST_TENANT.id)

    const { error: updateError2 } = await supabase
      .from('tenants')
      .update({
        owner_email: owner.email,
        owner_id: owner.id,
      })
      .eq('id', TEST_TENANT_2.id)

    if (updateError1 || updateError2) {
      console.log(`  ⚠ Could not update tenant owners: ${updateError1?.message || updateError2?.message}`)
    } else {
      console.log(`  ✓ Updated owners for tenants ${TEST_TENANT.id} and ${TEST_TENANT_2.id}`)
    }

    tenant = existingTenant
    console.log(`  ✓ Using demo tenant: ${tenant.id}`)

    // 2. Get or create non-owner user (idempotent)
    console.log(`  Getting or creating non-owner user: ${TEST_USERS.nonOwner.email}`)

    // Try to find existing non-owner user
    const existingNonOwner = allUsersData?.users?.find(u => u.email === TEST_USERS.nonOwner.email)

    let nonOwner
    if (existingNonOwner) {
      nonOwner = existingNonOwner
      console.log(`  ✓ Using existing non-owner user: ${nonOwner.id}`)
    } else {
      // Create new non-owner user if not found
      const { data: newNonOwner, error: nonOwnerError } = await supabase.auth.admin.createUser({
        email: TEST_USERS.nonOwner.email,
        password: TEST_USERS.nonOwner.password,
        email_confirm: true,
      })

      if (newNonOwner?.user) {
        nonOwner = newNonOwner.user
        console.log(`  ✓ Non-owner user created: ${nonOwner.id}`)
      } else if (nonOwnerError?.message?.includes('already been registered')) {
        // User exists but wasn't found by listUsers
        // Try to sign in to get the user object
        console.log(`  ⚠ Non-owner exists but not in list, trying sign-in...`)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: TEST_USERS.nonOwner.email,
          password: TEST_USERS.nonOwner.password,
        })

        if (signInData?.user) {
          nonOwner = signInData.user
          console.log(`  ✓ Retrieved non-owner user via sign-in: ${nonOwner.id}`)
          // Sign out to clean up session
          await supabase.auth.signOut()
        } else {
          throw new Error(`Non-owner user exists but could not be retrieved. Error: ${signInError?.message || 'Unknown'}. Manual cleanup required: delete user ${TEST_USERS.nonOwner.email} from Supabase auth.`)
        }
      } else {
        throw new Error(`Failed to create non-owner user: ${nonOwnerError?.message}`)
      }
    }

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
