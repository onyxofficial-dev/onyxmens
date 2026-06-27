import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient must only be used on the server')
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Service Role Key in environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
