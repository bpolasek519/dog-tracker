import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDogsByHousehold } from '@/lib/db/dogs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = { title: 'Dogs' }

export default async function DogsPage() {
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

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dogs</h1>
        <Button asChild size="sm">
          <Link href="/dogs/new">+ Add dog</Link>
        </Button>
      </div>

      {dogs && dogs.length > 0 ? (
        <ul className="space-y-2">
          {dogs.map((dog) => (
            <li key={dog.id}>
              <Link href={`/dogs/${dog.id}`}>
                <Card className="hover:bg-muted/50 transition-colors">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{dog.name}</p>
                      {dog.breed && (
                        <p className="text-sm text-muted-foreground">{dog.breed}</p>
                      )}
                    </div>
                    <span className="text-muted-foreground">›</span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🐾</p>
          <p className="font-medium">No dogs yet</p>
          <p className="text-sm mt-1">Add your first dog to get started.</p>
        </div>
      )}
    </div>
  )
}
