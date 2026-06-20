import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppShell from '@/components/app-shell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('household_members')
    .select('household_id, role, households(name)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!memberships) redirect('/onboarding')

  const household = memberships.households as unknown as { name: string } | null

  return (
    <AppShell householdId={memberships.household_id} householdName={household?.name ?? null}>
      {children}
    </AppShell>
  )
}
