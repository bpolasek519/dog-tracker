'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Dog = {
  name: string
  breed: string | null
  sex: string | null
  birthdate: string | null
  microchip: string | null
  notes: string | null
}

type State = { error?: string } | null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Action = (prevState: any, formData: FormData) => Promise<State | void>

export default function DogForm({
  action,
  defaultValues,
  submitLabel = 'Save',
}: {
  action: Action
  defaultValues?: Partial<Dog>
  submitLabel?: string
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, pending] = useActionState<State, FormData>(action as any, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultValues?.name ?? ''}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="breed">Breed</Label>
        <Input id="breed" name="breed" defaultValue={defaultValues?.breed ?? ''} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sex">Sex</Label>
        <Select name="sex" defaultValue={defaultValues?.sex ?? ''}>
          <SelectTrigger id="sex">
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="male_neutered">Male (neutered)</SelectItem>
            <SelectItem value="female_spayed">Female (spayed)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="birthdate">Date of birth</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          defaultValue={defaultValues?.birthdate ?? ''}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="microchip">Microchip #</Label>
        <Input
          id="microchip"
          name="microchip"
          defaultValue={defaultValues?.microchip ?? ''}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={defaultValues?.notes ?? ''}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
