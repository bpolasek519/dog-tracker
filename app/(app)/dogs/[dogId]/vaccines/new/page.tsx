import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import { getVaccineTypes } from '@/lib/db/vaccines'
import LogVaccinationForm from './log-vaccination-form'
import { Card, CardContent } from '@/components/ui/card'
import BackButton from '@/components/back-button'

type Props = { params: Promise<{ dogId: string }> }

export const metadata = { title: 'Log vaccination' }

export default async function NewVaccinationPage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  // Need householdId to fetch custom vaccine types
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .single()

  const { data: vaccineTypes } = await getVaccineTypes(
    supabase,
    membership?.household_id ?? ''
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href={`/dogs/${dogId}/vaccines`} />
        <h1 className="text-xl font-semibold">Log vaccination</h1>
      </div>
      <Card>
        <CardContent className="pt-4">
          <LogVaccinationForm dogId={dogId} vaccineTypes={vaccineTypes ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
