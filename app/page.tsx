import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/logout-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const name = profile?.display_name ?? user.email

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="font-semibold">Dog Tracker</span>
        <LogoutButton />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-semibold">Welcome, {name}!</h1>
        <p className="text-sm text-muted-foreground">
          Your dogs&apos; health hub. Phase 1 features coming soon.
        </p>
        <nav className="mt-4 flex gap-4 text-sm">
          <span className="rounded-md border px-3 py-1.5 text-muted-foreground">Dogs</span>
          <span className="rounded-md border px-3 py-1.5 text-muted-foreground">Weights</span>
          <span className="rounded-md border px-3 py-1.5 text-muted-foreground">Vaccines</span>
        </nav>
      </main>
    </div>
  )
}
