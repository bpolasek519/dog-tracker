import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import { getVaccinationsByDog } from '@/lib/db/vaccines'
import { classifyDue } from '@/lib/vaccines'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BackButton from '@/components/back-button'
import { format, parseISO } from 'date-fns'

type Props = { params: Promise<{ dogId: string }> }

export async function generateMetadata({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()
  const { data } = await getDogById(supabase, dogId)
  return { title: `${data?.name ?? 'Dog'} — Vaccines` }
}

const BUCKET_BADGE: Record<string, { label: string; variant: 'destructive' | 'secondary' | 'outline' }> = {
  overdue:  { label: 'Overdue',  variant: 'destructive' },
  due_soon: { label: 'Due soon', variant: 'secondary' },
  upcoming: { label: 'Upcoming', variant: 'outline' },
}

export default async function VaccinesPage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  const { data: vaccinations } = await getVaccinationsByDog(supabase, dogId)
  const today = new Date()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton href={`/dogs/${dogId}`} />
          <h1 className="text-xl font-semibold">{dog.name} — Vaccines</h1>
        </div>
        <Button asChild size="sm">
          <Link href={`/dogs/${dogId}/vaccines/new`}>+ Log</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {vaccinations && vaccinations.length > 0 ? (
            vaccinations.map((v) => {
              const name =
                (v.vaccine_types as unknown as { name: string } | null)?.name ?? v.custom_name ?? 'Unknown'
              const bucket = v.next_due_on ? classifyDue(parseISO(v.next_due_on), today) : null
              const badgeInfo = bucket ? BUCKET_BADGE[bucket] : null

              return (
                <div key={v.id} className="py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{name}</p>
                    {badgeInfo && (
                      <Badge variant={badgeInfo.variant} className="text-xs shrink-0">
                        {badgeInfo.label}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-3">
                    <span>Given: {format(parseISO(v.given_on), 'MMM d, yyyy')}</span>
                    {v.next_due_on && (
                      <span>Due: {format(parseISO(v.next_due_on), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                  {v.notes && <p className="text-xs text-muted-foreground italic">{v.notes}</p>}
                </div>
              )
            })
          ) : (
            <p className="py-4 text-center text-muted-foreground text-sm">No vaccinations recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
