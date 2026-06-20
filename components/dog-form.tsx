'use client'

import { useActionState, useState, useRef, startTransition } from 'react'
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
import PhotoCropDialog from '@/components/photo-crop-dialog'

type Dog = {
  name: string
  breed: string | null
  sex: string | null
  birthdate: string | null
  photo_url: string | null
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

  const [previewUrl, setPreviewUrl] = useState(defaultValues?.photo_url ?? '')
  const [rawSrc, setRawSrc] = useState('')
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  function openPicker() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setRawSrc(URL.createObjectURL(file))
    setDialogOpen(true)
    // reset so selecting the same file again still fires onChange
    e.target.value = ''
  }

  function handleCropApply(blob: Blob) {
    setCroppedBlob(blob)
    setPreviewUrl(URL.createObjectURL(blob))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (croppedBlob) fd.set('photo', croppedBlob, 'photo.jpg')
    startTransition(() => formAction(fd))
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label>Photo</Label>
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              type="button"
              onClick={openPicker}
              className="w-20 h-20 rounded-full bg-muted overflow-hidden ring-2 ring-border hover:ring-primary transition-all focus-visible:outline-none focus-visible:ring-primary"
              aria-label="Change photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || '/dog-placeholder.svg'}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
            <button
              type="button"
              onClick={openPicker}
              className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
            >
              {previewUrl ? 'Change photo' : 'Add photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
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

      <PhotoCropDialog
        open={dialogOpen}
        imageSrc={rawSrc}
        onClose={() => setDialogOpen(false)}
        onApply={handleCropApply}
      />
    </>
  )
}
