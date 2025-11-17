import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createSuperAdmin() {
  const email = 'gparrar@skywalking.dev'
  const password = 'SkywalkingAdmin2025!'

  console.log('Creating superadmin user...')

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('Error creating user:', error)
    process.exit(1)
  }

  console.log('✓ Superadmin user created successfully')
  console.log('Email:', email)
  console.log('User ID:', data.user.id)
  console.log('\nYou can now login at: http://localhost:3000/login')
}

createSuperAdmin()
