'use client'

import { useActionState } from 'react'
import { createHousehold } from '@/app/actions/household'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type State = { error?: string } | null

export default function OnboardingPage() {
  const [state, action, pending] = useActionState<State, FormData>(
    createHousehold,
    null
  )

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your household</CardTitle>
          <CardDescription>
            Give your household a name — your family or the dogs&apos; home.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Household name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. The Smith Family"
                required
                autoFocus
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Creating…' : 'Create household'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
