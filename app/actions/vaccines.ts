'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function logVaccination(dogId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const givenOn = formData.get('given_on') as string
  if (!givenOn) return { error: 'Given date is required' }

  const vaccineTypeId = (formData.get('vaccine_type_id') as string) || null
  const customName = (formData.get('custom_name') as string)?.trim() || null

  if (!vaccineTypeId && !customName) return { error: 'Select a vaccine or enter a custom name' }

  const nextDueOn = (formData.get('next_due_on') as string) || null
  const notes = (formData.get('notes') as string)?.trim() || null

  const { error } = await supabase.from('vaccinations').insert({
    dog_id: dogId,
    vaccine_type_id: vaccineTypeId,
    custom_name: vaccineTypeId ? null : customName,
    given_on: givenOn,
    next_due_on: nextDueOn || null,
    notes,
    recorded_by: user.id,
  })

  if (error) return { error: error.message }

  redirect(`/dogs/${dogId}/vaccines`)
}
