import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignupPage from '@/app/(auth)/signup/page'

const mockSignUp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signUp: mockSignUp },
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

async function fillAndSubmit(overrides: { name?: string; email?: string; password?: string } = {}) {
  const user = userEvent.setup()
  render(<SignupPage />)

  await user.type(screen.getByLabelText(/your name/i), overrides.name ?? 'Jane Smith')
  await user.type(screen.getByLabelText(/email/i), overrides.email ?? 'jane@example.com')
  await user.type(screen.getByLabelText(/password/i), overrides.password ?? 'password123')
  await user.click(screen.getByRole('button', { name: /create account/i }))
}

describe('SignupPage', () => {
  it('includes emailRedirectTo pointing to /auth/callback on the current origin', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    await fillAndSubmit()

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      )
    })
  })

  it('shows confirmation message after successful signup', async () => {
    mockSignUp.mockResolvedValue({ error: null })

    await fillAndSubmit({ email: 'jane@example.com' })

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('shows error message when signup fails', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already registered' } })

    await fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })
})
