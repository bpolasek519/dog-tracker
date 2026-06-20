'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInvite } from '@/app/actions/household'
import { Button } from '@/components/ui/button'

export default function AcceptInviteForm({ token }: { token: string }) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleAccept() {
    startTransition(async () => {
      const result = await acceptInvite(token)
      if (result?.error) {
        alert(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    })
  }

  return (
    <Button onClick={handleAccept} disabled={pending} className="w-full">
      {pending ? 'Joining…' : 'Accept invite'}
    </Button>
  )
}
