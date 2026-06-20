'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createHousehold(_prev: unknown, formData: FormData) {
  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'Household name is required' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_household', { p_name: name })

  if (error) return { error: error.message }

  redirect('/onboarding/dog')
}

export async function generateInvite(householdId: string): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('invites')
    .insert({ household_id: householdId, invited_by: user.id })
    .select('token')
    .single()

  if (error) return { error: error.message }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  return { url: `${baseUrl}/invite/${data.token}` }
}

export async function acceptInvite(token: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  const { data: invite, error: lookupError } = await admin
    .from('invites')
    .select('id, household_id, status, expires_at')
    .eq('token', token)
    .single()

  if (lookupError || !invite) return { error: 'Invite not found' }
  if (invite.status !== 'pending') return { error: 'This invite has already been used or revoked' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'This invite has expired' }

  // Check if already a member
  const { data: existing } = await admin
    .from('household_members')
    .select('user_id')
    .eq('household_id', invite.household_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Already a member — just redirect
    redirect('/')
  }

  const { error: insertError } = await admin
    .from('household_members')
    .insert({ household_id: invite.household_id, user_id: user.id, role: 'member' })

  if (insertError) return { error: insertError.message }

  await admin
    .from('invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)

  redirect('/')
}

export async function revokeInvite(inviteId: string): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('invites')
    .update({ status: 'revoked' })
    .eq('id', inviteId)

  if (error) return { error: error.message }
}
