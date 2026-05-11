import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Client-side singleton
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any = null
export function getClientSupabase() {
  if (!_client) _client = getSupabaseClient()
  return _client
}
