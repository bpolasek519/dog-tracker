import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import AcceptInviteForm from './accept-invite-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = { params: Promise<{ token: string }> }

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/invite/${token}`)

  const admin = createAdminClient()
  const { data: invite } = await admin
    .from('invites')
    .select('id, status, expires_at, household_id, households(name)')
    .eq('token', token)
    .single()

  if (!invite) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invalid invite</CardTitle>
            <CardDescription>This invite link doesn&apos;t exist or has been removed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invite expired or used</CardTitle>
            <CardDescription>Ask the household owner to send a new invite link.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const householdName = (invite.households as unknown as { name: string } | null)?.name ?? 'this household'

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>You&apos;ve been invited</CardTitle>
          <CardDescription>
            Join <strong>{householdName}</strong> on Dog Tracker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AcceptInviteForm token={token} />
        </CardContent>
      </Card>
    </div>
  )
}
