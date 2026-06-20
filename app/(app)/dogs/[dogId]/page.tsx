import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import { getLatestWeight } from '@/lib/db/weights'
import { getVaccinationsByDog } from '@/lib/db/vaccines'
import { kgToLbs, roundTo } from '@/lib/units'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO, differenceInYears, differenceInMonths } from 'date-fns'
import { classifyDue } from '@/lib/vaccines'
import BackButton from '@/components/back-button'
import { Pencil } from 'lucide-react'

type Props = { params: Promise<{ dogId: string }> }

const SEX_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  male_neutered: 'Male (neutered)',
  female_spayed: 'Female (spayed)',
}

export async function generateMetadata({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()
  const { data } = await getDogById(supabase, dogId)
  return { title: data?.name ?? 'Dog profile' }
}

export default async function DogProfilePage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  const [{ data: latestWeight }, { data: vaccinations }] = await Promise.all([
    getLatestWeight(supabase, dogId),
    getVaccinationsByDog(supabase, dogId),
  ])

  const today = new Date()

  function calcAge(birthdate: string): string {
    const birth = parseISO(birthdate)
    const years = differenceInYears(today, birth)
    const months = differenceInMonths(today, birth) % 12
    if (years === 0) return `${months} mo`
    if (months === 0) return `${years} yr`
    return `${years} yr, ${months} mo`
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton href="/dogs" />
          <h1 className="text-xl font-semibold">{dog.name}</h1>
        </div>
      </div>

      {/* Info */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-column justify-between">
          <div className="flex gap-4 items-center">
            <div className="shrink-0 w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dog.photo_url ?? '/dog-placeholder.svg'}
                alt=""
                className={dog.photo_url ? "w-full h-full object-cover" : "w-14 h-14 text-muted-foreground"}
              />
            </div>
            <div className="space-y-1 text-sm">
              {dog.breed && <p><span className="text-muted-foreground">Breed:</span> {dog.breed}</p>}
              {dog.sex && <p><span className="text-muted-foreground">Sex:</span> {SEX_LABELS[dog.sex] ?? dog.sex}</p>}
              {dog.birthdate && (
                <>
                  <p><span className="text-muted-foreground">Born:</span> {format(parseISO(dog.birthdate), 'MMM d, yyyy')}</p>
                  <p><span className="text-muted-foreground">Age:</span> {calcAge(dog.birthdate)}</p>
                </>
              )}
              {dog.microchip && <p><span className="text-muted-foreground">Microchip:</span> {dog.microchip}</p>}
            </div>
            </div>
            <Button asChild variant="outline" size="icon" aria-label="Edit dog">
              <Link href={`/dogs/${dogId}/edit`}><Pencil className="w-4 h-4" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Weight</CardTitle>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dogs/${dogId}/weights`}>History</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/dogs/${dogId}/weights/new`}>+ Add</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          {latestWeight ? (
            <p className="text-2xl font-semibold">
              {roundTo(kgToLbs(latestWeight.weight_kg), 1)} lbs
              <span className="text-sm font-normal text-muted-foreground ml-2">
                on {format(parseISO(latestWeight.measured_on), 'MMM d, yyyy')}
              </span>
            </p>
          ) : (
            <p className="text-muted-foreground">No weight recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Vaccines */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Vaccines</CardTitle>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/dogs/${dogId}/vaccines`}>History</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/dogs/${dogId}/vaccines/new`}>+ Log</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {vaccinations && vaccinations.length > 0 ? (
            vaccinations.slice(0, 5).map((v) => {
              const name =
                (v.vaccine_types as unknown as { name: string } | null)?.name ?? v.custom_name ?? 'Unknown'
              const bucket = v.next_due_on ? classifyDue(parseISO(v.next_due_on), today) : null
              const badgeVariant =
                bucket === 'overdue' ? 'destructive'
                : bucket === 'due_soon' ? 'secondary'
                : 'outline'
              return (
                <div key={v.id} className="flex items-center justify-between">
                  <span>{name}</span>
                  {v.next_due_on && (
                    <Badge variant={badgeVariant} className="text-xs">
                      Due {format(parseISO(v.next_due_on), 'MMM d, yyyy')}
                    </Badge>
                  )}
                </div>
              )
            })
          ) : (
            <p className="text-muted-foreground">No vaccinations recorded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notes</CardTitle>
            <Button asChild variant="outline" size="icon" aria-label="Edit notes">
              <Link href={`/dogs/${dogId}/notes/edit`}><Pencil className="w-4 h-4" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {dog.notes ?? <span className="italic">No notes yet.</span>}
        </CardContent>
      </Card>
    </div>
  )
}
