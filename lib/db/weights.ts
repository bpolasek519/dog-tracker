import type { SupabaseClient } from '@supabase/supabase-js'

export async function getWeightsByDog(supabase: SupabaseClient, dogId: string) {
  return supabase
    .from('weights')
    .select('id, weight_kg, measured_on, note, recorded_by, created_at')
    .eq('dog_id', dogId)
    .order('measured_on', { ascending: false })
}

export async function getLatestWeight(supabase: SupabaseClient, dogId: string) {
  return supabase
    .from('weights')
    .select('weight_kg, measured_on')
    .eq('dog_id', dogId)
    .order('measured_on', { ascending: false })
    .limit(1)
    .maybeSingle()
}
