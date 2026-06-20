'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createDog(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'No household found' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required' }

  const { data: dog, error } = await supabase
    .from('dogs')
    .insert({
      household_id: membership.household_id,
      name,
      breed: (formData.get('breed') as string)?.trim() || null,
      sex: (formData.get('sex') as string) || null,
      birthdate: (formData.get('birthdate') as string) || null,
      microchip: (formData.get('microchip') as string)?.trim() || null,
      notes: (formData.get('notes') as string)?.trim() || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  redirect(`/dogs/${dog.id}`)
}

export async function createDogOnboarding(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'No household found' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required' }

  const { error } = await supabase
    .from('dogs')
    .insert({
      household_id: membership.household_id,
      name,
      breed: (formData.get('breed') as string)?.trim() || null,
      sex: (formData.get('sex') as string) || null,
      birthdate: (formData.get('birthdate') as string) || null,
      microchip: (formData.get('microchip') as string)?.trim() || null,
      notes: (formData.get('notes') as string)?.trim() || null,
    })

  if (error) return { error: error.message }

  redirect('/onboarding/dog')
}

export async function updateDog(dogId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required' }

  const { error } = await supabase
    .from('dogs')
    .update({
      name,
      breed: (formData.get('breed') as string)?.trim() || null,
      sex: (formData.get('sex') as string) || null,
      birthdate: (formData.get('birthdate') as string) || null,
      microchip: (formData.get('microchip') as string)?.trim() || null,
      notes: (formData.get('notes') as string)?.trim() || null,
    })
    .eq('id', dogId)

  if (error) return { error: error.message }

  redirect(`/dogs/${dogId}`)
}

export async function deleteDog(dogId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('dogs').delete().eq('id', dogId)
  if (error) return { error: error.message }
  redirect('/dogs')
}
