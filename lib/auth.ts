import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false

  const superAdmins = process.env.SUPER_ADMINS?.split(',').map((e) => e.trim()) || []
  return superAdmins.includes(email)
}

export async function getServerSession() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  return { session, error }
}

export async function getUser() {
  const { session } = await getServerSession()
  return session?.user || null
}
