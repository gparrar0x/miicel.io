/**
 * Create platform admin user using Supabase Admin API
 * Usage: node scripts/create-admin.js
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function createAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Create tenant admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'tenant@miicel.io',
      password: 'Tenant123!',
      email_confirm: true,
      user_metadata: {
        name: 'Tenant Admin',
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      process.exit(1)
    }

    console.log('✓ Auth user created:', authData.user.id)

    // Create user record in users table
    const { error: userError } = await supabase.from('users').insert({
      auth_user_id: authData.user.id,
      email: 'tenant@miicel.io',
      name: 'Tenant Admin',
      role: 'tenant_admin',
      tenant_id: 3,
      is_active: true,
    })

    if (userError) {
      console.error('Error creating user record:', userError)
      process.exit(1)
    }

    console.log('✓ User record created')
    console.log('\nTenant admin created successfully!')
    console.log('Email: tenant@miicel.io')
    console.log('Password: Tenant123!')
    console.log('Tenant ID: 3')
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

createAdmin()
