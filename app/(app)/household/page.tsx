import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata = { title: 'Household' }

export default async function HouseholdPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, role, households(name)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const household = membership.households as unknown as { name: string } | null
  const isOwner = membership.role === 'owner'

  const { data: members } = await supabase
    .from('household_members')
    .select('role, joined_at, profiles(display_name, email)')
    .eq('household_id', membership.household_id)
    .order('joined_at')

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Household</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{household?.name ?? 'Your household'}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>Your role: <span className="capitalize text-foreground">{membership.role}</span></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {members?.map((m, i) => {
            const profile = m.profiles as unknown as { display_name: string | null; email: string | null } | null
            return (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">{profile?.display_name ?? profile?.email ?? 'Unknown'}</p>
                  {profile?.email && profile?.display_name && (
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  )}
                </div>
                <Badge variant={m.role === 'owner' ? 'default' : 'outline'} className="text-xs capitalize">
                  {m.role}
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {isOwner && (
        <Button asChild className="w-full">
          <Link href="/household/invite">Invite someone</Link>
        </Button>
      )}
    </div>
  )
}
