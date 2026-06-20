import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogsByHousehold } from '@/lib/db/dogs'
import { createDogOnboarding } from '@/app/actions/dogs'
import DogForm from '@/components/dog-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function OnboardingDogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: dogs } = await getDogsByHousehold(supabase, membership.household_id)
  const hasDogs = dogs && dogs.length > 0

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Add your dogs</CardTitle>
          <CardDescription>
            {hasDogs
              ? 'Add another dog or tap Done to continue.'
              : 'Tell us about your pup. You can always add more information later.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasDogs && (
            <ul className="space-y-1.5">
              {dogs.map((dog) => (
                <li key={dog.id} className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">✓</span>
                  {dog.name}
                </li>
              ))}
            </ul>
          )}
          <DogForm action={createDogOnboarding} submitLabel="Add dog" />
          <Button asChild variant="outline" className="w-full">
            <Link href="/">{hasDogs ? 'Done' : 'Skip for now'}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
