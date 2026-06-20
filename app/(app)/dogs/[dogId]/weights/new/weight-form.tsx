'use client'

import { useActionState } from 'react'
import { addWeight } from '@/app/actions/weights'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import BackButton from '@/components/back-button'

type State = { error?: string } | null

export default function WeightForm({ dogId, dogName }: { dogId: string; dogName: string }) {
  const addWeightForDog = addWeight.bind(null, dogId)
  const [state, action, pending] = useActionState<State, FormData>(addWeightForDog, null)

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href={`/dogs/${dogId}/weights`} />
        <h1 className="text-xl font-semibold">Add weight for {dogName}</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lbs">Weight (lbs) *</Label>
              <Input
                id="lbs"
                name="lbs"
                type="number"
                step="0.1"
                min="0.1"
                max="300"
                required
                autoFocus
                placeholder="e.g. 54.5"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="measured_on">Date</Label>
              <div className="w-full overflow-x-hidden">
                <Input
                  id="measured_on"
                  name="measured_on"
                  type="date"
                  defaultValue={today}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                name="note"
                rows={2}
                placeholder="e.g. After morning walk"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Saving…' : 'Save weight'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
