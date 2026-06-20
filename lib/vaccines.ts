import { addMonths, differenceInDays, parseISO } from 'date-fns'

export type DueBucket = 'overdue' | 'due_soon' | 'upcoming'

export const DEFAULT_LEAD_DAYS = 7

export function suggestNextDue(givenOn: Date, intervalMonths: number): Date {
  return addMonths(givenOn, intervalMonths)
}

export function classifyDue(
  nextDueOn: Date,
  today: Date = new Date(),
  leadDays: number = DEFAULT_LEAD_DAYS
): DueBucket {
  const diff = differenceInDays(nextDueOn, today)
  if (diff < 0) return 'overdue'
  if (diff <= leadDays) return 'due_soon'
  return 'upcoming'
}

export type VaccineDueItem = {
  dogId: string
  dogName: string
  vaccineName: string
  nextDueOn: Date
  bucket: DueBucket
  daysUntilDue: number
}

export function buildDueSoonList(
  vaccinations: Array<{
    dog_id: string
    dog_name: string
    vaccine_name: string
    next_due_on: string
  }>,
  today: Date = new Date(),
  leadDays: number = DEFAULT_LEAD_DAYS
): VaccineDueItem[] {
  return vaccinations
    .filter((v) => v.next_due_on)
    .map((v) => {
      const due = parseISO(v.next_due_on)
      return {
        dogId: v.dog_id,
        dogName: v.dog_name,
        vaccineName: v.vaccine_name,
        nextDueOn: due,
        bucket: classifyDue(due, today, leadDays),
        daysUntilDue: differenceInDays(due, today),
      }
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}
