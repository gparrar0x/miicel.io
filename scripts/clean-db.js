#!/usr/bin/env node

/**
 * Clean Test Data from Database
 * Removes all test tenants and related data from the remote Supabase database
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('node:path')

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function cleanDatabase() {
  console.log('🗑️  Cleaning ALL data except tenant #1...\n')

  try {
    // Get all tenants except ID 1
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('id, slug, owner_id')
      .neq('id', 1)

    if (tenantsError) {
      throw new Error(`Failed to fetch tenants: ${tenantsError.message}`)
    }

    if (!tenants || tenants.length === 0) {
      console.log('✅ No tenants to delete. Only tenant #1 exists!')
      return
    }

    console.log(`📋 Found ${tenants.length} tenant(s) to delete:`)
    tenants.forEach((t) => console.log(`   - ${t.slug} (ID: ${t.id})`))
    console.log()

    const tenantIds = tenants.map((t) => t.id)
    const ownerIds = tenants.map((t) => t.owner_id).filter(Boolean)

    // Delete orders (cascade will handle order_items)
    console.log('🗑️  Deleting test orders...')
    const { error: ordersError } = await supabase.from('orders').delete().in('tenant_id', tenantIds)

    if (ordersError) {
      console.error('⚠️  Error deleting orders:', ordersError.message)
    } else {
      console.log('   ✓ Orders deleted')
    }

    // Delete customers
    console.log('🗑️  Deleting test customers...')
    const { error: customersError } = await supabase
      .from('customers')
      .delete()
      .in('tenant_id', tenantIds)

    if (customersError) {
      console.error('⚠️  Error deleting customers:', customersError.message)
    } else {
      console.log('   ✓ Customers deleted')
    }

    // Delete products
    console.log('🗑️  Deleting test products...')
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .in('tenant_id', tenantIds)

    if (productsError) {
      console.error('⚠️  Error deleting products:', productsError.message)
    } else {
      console.log('   ✓ Products deleted')
    }

    // Delete tenants
    console.log('🗑️  Deleting tenants...')
    const { error: deleteError } = await supabase.from('tenants').delete().neq('id', 1)

    if (deleteError) {
      throw new Error(`Failed to delete tenants: ${deleteError.message}`)
    }

    console.log(`   ✓ ${tenants.length} tenant(s) deleted`)

    // Delete auth users (if any)
    if (ownerIds.length > 0) {
      console.log('🗑️  Deleting auth users...')
      let deletedUsers = 0

      for (const userId of ownerIds) {
        try {
          const { error: userError } = await supabase.auth.admin.deleteUser(userId)
          if (!userError) {
            deletedUsers++
          } else if (userError.message && !userError.message.includes('not found')) {
            console.error(`   ⚠️  Error deleting user ${userId}:`, userError.message)
          }
        } catch (_err) {
          // Ignore errors for users that don't exist
        }
      }

      if (deletedUsers > 0) {
        console.log(`   ✓ ${deletedUsers} auth user(s) deleted`)
      } else {
        console.log('   ℹ️  No auth users deleted (may have been already removed)')
      }
    }

    console.log()
    console.log('✅ Database cleaned successfully!')
    console.log(`   • Tenants deleted: ${tenants.length}`)
    console.log('   • Only tenant #1 remains')
  } catch (error) {
    console.error('\n❌ Error cleaning database:', error.message)
    process.exit(1)
  }
}

cleanDatabase()
