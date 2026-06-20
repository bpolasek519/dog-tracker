'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter()
  if (href) {
    return (
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={href}>‹ Back</Link>
      </Button>
    )
  }
  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
      ‹ Back
    </Button>
  )
}
