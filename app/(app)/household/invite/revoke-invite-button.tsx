'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { revokeInvite } from '@/app/actions/household'
import { Button } from '@/components/ui/button'

export default function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleRevoke() {
    startTransition(async () => {
      await revokeInvite(inviteId)
      router.refresh()
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={handleRevoke}
      className="text-destructive hover:text-destructive"
    >
      {pending ? '…' : 'Revoke'}
    </Button>
  )
}
