import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogById } from '@/lib/db/dogs'
import { updateDog } from '@/app/actions/dogs'
import DogForm from '@/components/dog-form'
import { Card, CardContent } from '@/components/ui/card'
import BackButton from '@/components/back-button'
import DeleteDogButton from './delete-dog-button'

type Props = { params: Promise<{ dogId: string }> }

export const metadata = { title: 'Edit dog' }

export default async function EditDogPage({ params }: Props) {
  const { dogId } = await params
  const supabase = await createClient()

  const { data: dog } = await getDogById(supabase, dogId)
  if (!dog) notFound()

  const updateDogAction = updateDog.bind(null, dogId)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href={`/dogs/${dogId}`} />
        <h1 className="text-xl font-semibold">Edit {dog.name}</h1>
      </div>
      <Card>
        <CardContent className="pt-4">
          <DogForm
            action={updateDogAction}
            defaultValues={{
              name: dog.name,
              breed: dog.breed,
              sex: dog.sex,
              birthdate: dog.birthdate,
              photo_url: dog.photo_url,
              microchip: dog.microchip,
              notes: dog.notes,
            }}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
      <DeleteDogButton dogId={dogId} dogName={dog.name} />
    </div>
  )
}
