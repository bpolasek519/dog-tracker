import { createDog } from '@/app/actions/dogs'
import DogForm from '@/components/dog-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import BackButton from '@/components/back-button'

export const metadata = { title: 'Add dog' }

export default function NewDogPage() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <BackButton href="/dogs" />
        <h1 className="text-xl font-semibold">Add dog</h1>
      </div>
      <Card>
        <CardContent className="pt-4">
          <DogForm action={createDog} submitLabel="Add dog" />
        </CardContent>
      </Card>
    </div>
  )
}
