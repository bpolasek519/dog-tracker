'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import LogoutButton from '@/components/logout-button'
import PullToRefreshMain from '@/components/pull-to-refresh-main'

const NAV_ITEMS = [
  { href: '/',           label: 'Dashboard', icon: '🏠' },
  { href: '/dogs',       label: 'Dogs',      icon: '🐾' },
  { href: '/household',  label: 'Household', icon: '⚙️'  },
]

export default function AppShell({
  householdId,
  householdName,
  children,
}: {
  householdId: string
  householdName: string | null
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col min-h-full">
      <header className="flex items-center justify-between border-b px-6 py-3 shrink-0">
        <div className="flex flex-col">
          <span className="font-semibold text-sm tracking-wide">Dog Tracker</span>
          {householdName && (
            <span className="text-xs text-muted-foreground">{householdName}</span>
          )}
        </div>
        <LogoutButton />
      </header>

      <PullToRefreshMain className="flex-1 overflow-y-auto pb-28">
        {children}
      </PullToRefreshMain>

      <nav
        className="fixed bottom-0 inset-x-0 border-t bg-background z-10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="flex">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3.5 text-sm font-medium transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-2xl leading-none">{icon}</span>
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
