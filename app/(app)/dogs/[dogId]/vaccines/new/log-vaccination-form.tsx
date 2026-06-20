'use client'

import { useState, useActionState } from 'react'
import { addMonths, format } from 'date-fns'
import { logVaccination } from '@/app/actions/vaccines'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

type VaccineType = {
  id: string
  name: string
  default_interval_months: number | null
  is_preset: boolean
  household_id: string | null
}

type State = { error?: string } | null

const CUSTOM = '__custom__'

export default function LogVaccinationForm({
  dogId,
  vaccineTypes,
}: {
  dogId: string
  vaccineTypes: VaccineType[]
}) {
  const logVaccinationForDog = logVaccination.bind(null, dogId)
  const [state, action, pending] = useActionState<State, FormData>(logVaccinationForDog, null)

  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [givenOn, setGivenOn] = useState(new Date().toISOString().slice(0, 10))
  const [nextDueOn, setNextDueOn] = useState('')

  const presets = vaccineTypes.filter((v) => v.is_preset)
  const custom = vaccineTypes.filter((v) => !v.is_preset)
  const isCustomEntry = selectedTypeId === CUSTOM

  function handleTypeChange(value: string) {
    setSelectedTypeId(value)
    if (value && value !== CUSTOM) {
      const type = vaccineTypes.find((v) => v.id === value)
      if (type?.default_interval_months && givenOn) {
        const suggested = addMonths(new Date(givenOn), type.default_interval_months)
        setNextDueOn(format(suggested, 'yyyy-MM-dd'))
      }
    } else {
      setNextDueOn('')
    }
  }

  function handleGivenOnChange(value: string) {
    setGivenOn(value)
    if (selectedTypeId && selectedTypeId !== CUSTOM && value) {
      const type = vaccineTypes.find((v) => v.id === selectedTypeId)
      if (type?.default_interval_months) {
        const suggested = addMonths(new Date(value), type.default_interval_months)
        setNextDueOn(format(suggested, 'yyyy-MM-dd'))
      }
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="vaccine_type">Vaccine *</Label>
        <Select
          name="vaccine_type_id"
          value={isCustomEntry ? '' : selectedTypeId}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger id="vaccine_type">
            <SelectValue placeholder="Select vaccine…" />
          </SelectTrigger>
          <SelectContent>
            {presets.length > 0 && (
              <SelectGroup>
                <SelectLabel>Common vaccines</SelectLabel>
                {presets.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectGroup>
            )}
            {custom.length > 0 && (
              <>
                <Separator />
                <SelectGroup>
                  <SelectLabel>Your vaccines</SelectLabel>
                  {custom.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
            <Separator />
            <SelectItem value={CUSTOM}>Other / custom name…</SelectItem>
          </SelectContent>
        </Select>
        {/* Pass empty string when custom so server receives it as null */}
        {isCustomEntry && <input type="hidden" name="vaccine_type_id" value="" />}
      </div>

      {isCustomEntry && (
        <div className="space-y-1.5">
          <Label htmlFor="custom_name">Vaccine name *</Label>
          <Input id="custom_name" name="custom_name" placeholder="e.g. Giardia" required autoFocus />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="given_on">Date given *</Label>
        <Input
          id="given_on"
          name="given_on"
          type="date"
          value={givenOn}
          onChange={(e) => handleGivenOnChange(e.target.value)}
          required
          className="[&::-webkit-date-and-time-value]:w-full"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="next_due_on">Next due date</Label>
        <Input
          id="next_due_on"
          name="next_due_on"
          type="date"
          value={nextDueOn}
          onChange={(e) => setNextDueOn(e.target.value)}
          placeholder="Auto-filled from vaccine interval"
          className="[&::-webkit-date-and-time-value]:w-full"
        />
        {nextDueOn && (
          <p className="text-xs text-muted-foreground">
            Auto-suggested from vaccine interval — edit if needed.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} placeholder="e.g. No adverse reactions" />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" className="w-full" disabled={pending || !selectedTypeId}>
        {pending ? 'Saving…' : 'Log vaccination'}
      </Button>
    </form>
  )
}
