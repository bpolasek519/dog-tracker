'use client'

import { useActionState } from 'react'
import { updateDogNotes } from '@/app/actions/dogs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type State = { error?: string } | null

export default function EditNotesForm({ dogId, defaultNotes }: { dogId: string; defaultNotes: string | null }) {
  const updateNotesForDog = updateDogNotes.bind(null, dogId)
  const [state, action, pending] = useActionState<State, FormData>(updateNotesForDog, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={6}
          defaultValue={defaultNotes ?? ''}
          placeholder="Anything worth remembering about this dog…"
          autoFocus
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Save notes'}
      </Button>
    </form>
  )
}
