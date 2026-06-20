import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import WeightForm from './weight-form'

type Props = { params: Promise<{ dogId: string }> }

export default async function NewWeightPage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  return <WeightForm dogId={dogId} dogName={dog.name} />
}
