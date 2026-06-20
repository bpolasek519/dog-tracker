'use client'

import { useState, useActionState } from 'react'
import { addMonths } from 'date-fns'
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
import DatePickerInput from '@/components/date-picker-input'

type VaccineType = {
  id: string
  name: string
  default_interval_months: number | null
  is_preset: boolean
  household_id: string | null
}

type State = { error?: string } | null

const CUSTOM = '__custom__'

function recalcNextDue(givenOn: Date, intervalMonths: number): Date {
  return addMonths(givenOn, intervalMonths)
}

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
  const [givenOn, setGivenOn] = useState<Date | undefined>(new Date())
  const [nextDueOn, setNextDueOn] = useState<Date | undefined>(undefined)

  const presets = vaccineTypes.filter((v) => v.is_preset)
  const custom = vaccineTypes.filter((v) => !v.is_preset)
  const isCustomEntry = selectedTypeId === CUSTOM

  function handleTypeChange(value: string) {
    setSelectedTypeId(value)
    if (value && value !== CUSTOM && givenOn) {
      const type = vaccineTypes.find((v) => v.id === value)
      if (type?.default_interval_months) {
        setNextDueOn(recalcNextDue(givenOn, type.default_interval_months))
      }
    } else {
      setNextDueOn(undefined)
    }
  }

  function handleGivenOnChange(date: Date | undefined) {
    setGivenOn(date)
    if (selectedTypeId && selectedTypeId !== CUSTOM && date) {
      const type = vaccineTypes.find((v) => v.id === selectedTypeId)
      if (type?.default_interval_months) {
        setNextDueOn(recalcNextDue(date, type.default_interval_months))
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
        <Label>Date given *</Label>
        <DatePickerInput
          name="given_on"
          value={givenOn}
          onChange={handleGivenOnChange}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Next due date</Label>
        <DatePickerInput
          name="next_due_on"
          value={nextDueOn}
          onChange={setNextDueOn}
          placeholder="Pick a date (optional)"
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
