import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from './admin'

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  )
}

export async function validateRole(allowedRoles?: string[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Unauthorized: No active session')
  }

  const adminClient = createAdminClient()
  const { data: staff, error: dbError } = await adminClient
    .from('staff_accounts')
    .select('role, is_active')
    .eq('email', user.email)
    .single()

  if (dbError || !staff || !staff.is_active) {
    throw new Error('Unauthorized: Access denied')
  }

  // If allowedRoles is provided, check if user has one of them. Otherwise, default to full_admin
  const rolesToCheck = allowedRoles && allowedRoles.length > 0
    ? allowedRoles
    : ['full_admin']

  if (!rolesToCheck.includes(staff.role)) {
    throw new Error('Unauthorized: Insufficient permissions')
  }

  return { user, staff }
}

