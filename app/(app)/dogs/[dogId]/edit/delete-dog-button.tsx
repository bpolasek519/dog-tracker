'use client'

import { useTransition } from 'react'
import { deleteDog } from '@/app/actions/dogs'
import { Button } from '@/components/ui/button'

export default function DeleteDogButton({ dogId, dogName }: { dogId: string; dogName: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`Delete ${dogName}? This will also delete all their weight and vaccine records.`)) return
    startTransition(async () => {
      const result = await deleteDog(dogId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <Button
      variant="destructive"
      className="w-full"
      disabled={pending}
      onClick={handleDelete}
    >
      {pending ? 'Deleting…' : `Delete ${dogName}`}
    </Button>
  )
}
