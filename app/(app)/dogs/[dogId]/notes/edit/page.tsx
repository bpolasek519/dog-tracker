import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import { Card, CardContent } from '@/components/ui/card'
import BackButton from '@/components/back-button'
import EditNotesForm from './edit-notes-form'

type Props = { params: Promise<{ dogId: string }> }

export const metadata = { title: 'Edit notes' }

export default async function EditDogNotesPage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href={`/dogs/${dogId}`} />
        <h1 className="text-xl font-semibold">Edit notes</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <EditNotesForm dogId={dogId} defaultNotes={dog.notes} />
        </CardContent>
      </Card>
    </div>
  )
}
