import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLatestVaccinationsForHousehold } from '@/lib/db/vaccines'
import { buildDueSoonList, type VaccineDueItem } from '@/lib/vaccines'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export const metadata = { title: 'Dashboard' }

function DueSection({
  title,
  items,
  badgeVariant,
  badgeLabel,
  emptyText,
}: {
  title: string
  items: VaccineDueItem[]
  badgeVariant: 'destructive' | 'secondary' | 'outline'
  badgeLabel: (item: VaccineDueItem) => string
  emptyText: string
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </h2>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.dogId}-${item.vaccineName}`}>
              <Link href={`/dogs/${item.dogId}/vaccines`} className="block rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{item.vaccineName}</p>
                    <p className="text-xs text-muted-foreground">{item.dogName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={badgeVariant} className="text-xs mb-1">
                      {badgeLabel(item)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {format(item.nextDueOn, 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground py-2">{emptyText}</p>
      )}
    </section>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  const { data: rawVaccinations } = await getLatestVaccinationsForHousehold(
    supabase,
    membership.household_id
  )

  const today = new Date()
  const allItems = buildDueSoonList(rawVaccinations ?? [], today)

  const overdue  = allItems.filter((i) => i.bucket === 'overdue')
  const dueSoon  = allItems.filter((i) => i.bucket === 'due_soon')
  const upcoming = allItems.filter((i) => i.bucket === 'upcoming')

  const hasAny = allItems.length > 0

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-semibold">Due soon</h1>

      {!hasAny ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium">All caught up!</p>
          <p className="text-sm mt-1">No vaccines on the radar.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/dogs">View dogs</Link>
          </Button>
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <DueSection
              title="Overdue"
              items={overdue}
              badgeVariant="destructive"
              badgeLabel={(i) => `${Math.abs(i.daysUntilDue)}d overdue`}
              emptyText=""
            />
          )}

          {dueSoon.length > 0 && (
            <DueSection
              title="Due soon"
              items={dueSoon}
              badgeVariant="secondary"
              badgeLabel={(i) => i.daysUntilDue === 0 ? 'Today' : `${i.daysUntilDue}d`}
              emptyText=""
            />
          )}

          <DueSection
            title="Upcoming"
            items={upcoming}
            badgeVariant="outline"
            badgeLabel={(i) => `${i.daysUntilDue}d`}
            emptyText="Nothing coming up soon."
          />
        </>
      )}
    </div>
  )
}
