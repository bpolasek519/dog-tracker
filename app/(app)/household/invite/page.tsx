import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GenerateInviteButton from './generate-invite-button'
import RevokeInviteButton from './revoke-invite-button'
import BackButton from '@/components/back-button'
import { format, parseISO } from 'date-fns'

export const metadata = { title: 'Invite someone' }

export default async function InvitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'owner') redirect('/household')

  const { data: pendingInvites } = await supabase
    .from('invites')
    .select('id, token, email, status, expires_at, created_at')
    .eq('household_id', membership.household_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/household" />
        <h1 className="text-xl font-semibold">Invite someone</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate invite link</CardTitle>
          <CardDescription>
            Share the link with whoever you want to add to your household.
            Links expire after 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateInviteButton householdId={membership.household_id} />
        </CardContent>
      </Card>

      {pendingInvites && pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 gap-2">
                <div className="text-sm">
                  {inv.email && <p className="font-medium">{inv.email}</p>}
                  <p className="text-xs text-muted-foreground">
                    Expires {format(parseISO(inv.expires_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <RevokeInviteButton inviteId={inv.id} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
