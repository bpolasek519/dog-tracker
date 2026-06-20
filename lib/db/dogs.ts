import type { SupabaseClient } from '@supabase/supabase-js'

export async function getDogsByHousehold(
  supabase: SupabaseClient,
  householdId: string
) {
  return supabase
    .from('dogs')
    .select('id, name, breed, sex, birthdate, photo_url, microchip, notes, created_at')
    .eq('household_id', householdId)
    .order('name')
}

export async function getDogById(supabase: SupabaseClient, dogId: string) {
  return supabase
    .from('dogs')
    .select('id, name, breed, sex, birthdate, photo_url, microchip, notes, household_id, created_at')
    .eq('id', dogId)
    .single()
}
