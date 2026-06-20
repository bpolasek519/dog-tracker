'use client'

import { useState, useTransition } from 'react'
import { generateInvite } from '@/app/actions/household'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function GenerateInviteButton({ householdId }: { householdId: string }) {
  const [pending, startTransition] = useTransition()
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const result = await generateInvite(householdId)
      if ('error' in result) {
        setError(result.error)
      } else {
        setInviteUrl(result.url)
      }
    })
  }

  async function handleCopy() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      {inviteUrl ? (
        <>
          <div className="flex gap-2">
            <Input value={inviteUrl} readOnly className="text-xs" />
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <Button onClick={handleGenerate} variant="ghost" size="sm" disabled={pending}>
            Generate new link
          </Button>
        </>
      ) : (
        <Button onClick={handleGenerate} disabled={pending} className="w-full">
          {pending ? 'Generating…' : 'Generate invite link'}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
