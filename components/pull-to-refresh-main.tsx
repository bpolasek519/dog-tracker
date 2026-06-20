'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PullToRefreshMain({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useRouter()
  const mainRef = useRef<HTMLElement>(null)
  const startY = useRef(0)
  const [status, setStatus] = useState<'idle' | 'pulling' | 'ready' | 'refreshing'>('idle')

  return (
    <main
      ref={mainRef}
      className={className}
      onTouchStart={(e) => { startY.current = e.touches[0].clientY }}
      onTouchMove={(e) => {
        if (mainRef.current?.scrollTop !== 0 || status === 'refreshing') return
        const delta = e.touches[0].clientY - startY.current
        if (delta > 10) setStatus('pulling')
        if (delta > 72) setStatus('ready')
      }}
      onTouchEnd={() => {
        if (status === 'ready') {
          setStatus('refreshing')
          router.refresh()
          setTimeout(() => setStatus('idle'), 1500)
        } else {
          setStatus('idle')
        }
      }}
    >
      {status !== 'idle' && (
        <div className="flex justify-center py-3 text-muted-foreground text-sm">
          {status === 'refreshing' ? '↻ Refreshing…' : status === 'ready' ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      {children}
    </main>
  )
}
