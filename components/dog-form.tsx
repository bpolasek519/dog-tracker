'use client'

import { useActionState, useState } from 'react'
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
  photo_url: string | null  // existing stored URL; used only for initial preview
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
  const [photoUrl, setPhotoUrl] = useState(defaultValues?.photo_url ?? '')

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
        <Label htmlFor="photo">Photo</Label>
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl || '/dog-placeholder.svg'}
              alt=""
              className="w-7 h-7 object-cover text-muted-foreground"
            />
          </div>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setPhotoUrl(URL.createObjectURL(file))
            }}
          />
        </div>
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
