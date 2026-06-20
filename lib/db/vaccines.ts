import type { SupabaseClient } from '@supabase/supabase-js'

export async function getVaccinationsByDog(
  supabase: SupabaseClient,
  dogId: string
) {
  return supabase
    .from('vaccinations')
    .select(
      'id, given_on, next_due_on, notes, custom_name, created_at, vaccine_types(id, name, default_interval_months)'
    )
    .eq('dog_id', dogId)
    .order('given_on', { ascending: false })
}

export async function getVaccineTypes(supabase: SupabaseClient, householdId: string) {
  return supabase
    .from('vaccine_types')
    .select('id, name, default_interval_months, is_preset, household_id')
    .or(`is_preset.eq.true,household_id.eq.${householdId}`)
    .order('is_preset', { ascending: false })
    .order('name')
}

export async function getLatestVaccinationsForHousehold(
  supabase: SupabaseClient,
  householdId: string
) {
  return supabase.rpc('latest_vaccinations_for_household', {
    p_household_id: householdId,
  })
}
