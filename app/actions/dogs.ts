'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function uploadDogPhoto(file: File, dogId: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${dogId}/${Date.now()}.${ext}`
  const admin = createAdminClient()
  const { error } = await admin.storage.from('dog-photos').upload(path, file)
  if (error) return null
  const { data } = admin.storage.from('dog-photos').getPublicUrl(path)
  return data.publicUrl
}

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

  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    const photoUrl = await uploadDogPhoto(photoFile, dog.id)
    if (photoUrl) {
      await supabase.from('dogs').update({ photo_url: photoUrl }).eq('id', dog.id)
    }
  }

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

  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0 && dog) {
    const photoUrl = await uploadDogPhoto(photoFile, dog.id)
    if (photoUrl) {
      await supabase.from('dogs').update({ photo_url: photoUrl }).eq('id', dog.id)
    }
  }

  redirect('/onboarding/dog')
}

export async function updateDog(dogId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient()

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Name is required' }

  const update: Record<string, unknown> = {
    name,
    breed: (formData.get('breed') as string)?.trim() || null,
    sex: (formData.get('sex') as string) || null,
    birthdate: (formData.get('birthdate') as string) || null,
    microchip: (formData.get('microchip') as string)?.trim() || null,
    notes: (formData.get('notes') as string)?.trim() || null,
  }

  const photoFile = formData.get('photo') as File | null
  if (photoFile && photoFile.size > 0) {
    const photoUrl = await uploadDogPhoto(photoFile, dogId)
    if (photoUrl) update.photo_url = photoUrl
  }

  const { error } = await supabase.from('dogs').update(update).eq('id', dogId)
  if (error) return { error: error.message }

  redirect(`/dogs/${dogId}`)
}

export async function updateDogNotes(dogId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('dogs')
    .update({ notes: (formData.get('notes') as string)?.trim() || null })
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
