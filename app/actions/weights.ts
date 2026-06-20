'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { lbsToKg } from '@/lib/units'

export async function addWeight(dogId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const lbsRaw = formData.get('lbs') as string
  const lbs = parseFloat(lbsRaw)
  if (!lbsRaw || isNaN(lbs) || lbs <= 0) return { error: 'Enter a valid weight in lbs' }

  const measuredOn = (formData.get('measured_on') as string) || new Date().toISOString().slice(0, 10)
  const note = (formData.get('note') as string)?.trim() || null

  const { error } = await supabase.from('weights').insert({
    dog_id: dogId,
    weight_kg: lbsToKg(lbs),
    measured_on: measuredOn,
    note,
    recorded_by: user.id,
  })

  if (error) return { error: error.message }

  redirect(`/dogs/${dogId}/weights`)
}
