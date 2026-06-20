import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import { getWeightsByDog } from '@/lib/db/weights'
import { kgToLbs, roundTo } from '@/lib/units'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BackButton from '@/components/back-button'
import WeightChart from '@/components/dogs/weight-chart'
import { format, parseISO } from 'date-fns'

type Props = { params: Promise<{ dogId: string }> }

export async function generateMetadata({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()
  const { data } = await getDogById(supabase, dogId)
  return { title: `${data?.name ?? 'Dog'} — Weights` }
}

export default async function WeightsPage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  const { data: weights } = await getWeightsByDog(supabase, dogId)

  // Chart data: oldest → newest, converted to lbs
  const chartData = (weights ?? [])
    .slice()
    .reverse()
    .map((w) => ({
      date: format(parseISO(w.measured_on), 'MM/dd'),
      lbs: roundTo(kgToLbs(w.weight_kg), 1),
    }))

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton href={`/dogs/${dogId}`} />
          <h1 className="text-xl font-semibold">{dog.name} — Weights</h1>
        </div>
        <Button asChild size="sm">
          <Link href={`/dogs/${dogId}/weights/new`}>+ Add</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {weights && weights.length > 0 ? (
            weights.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">{roundTo(kgToLbs(w.weight_kg), 1)} lbs</p>
                  {w.note && <p className="text-xs text-muted-foreground">{w.note}</p>}
                </div>
                <p className="text-muted-foreground">
                  {format(parseISO(w.measured_on), 'MMM d, yyyy')}
                </p>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-muted-foreground text-sm">No weights yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
