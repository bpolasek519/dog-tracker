import { createClient } from '@supabase/supabase-js'

// Only import in server actions — never in Client Components.
// Uses SUPABASE_SECRET_KEY (the sb_secret_... key) to bypass RLS for trusted writes
// like invite acceptance, where the caller is not yet a household member.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}
