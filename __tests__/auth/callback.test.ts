import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/auth/callback/route'

const mockExchangeCodeForSession = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: { exchangeCodeForSession: mockExchangeCodeForSession },
    }),
}))

beforeEach(() => {
  mockExchangeCodeForSession.mockReset()
})

describe('GET /auth/callback', () => {
  it('exchanges the code and redirects to / on success', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const req = new Request('http://localhost:3000/auth/callback?code=valid123')
    const res = await GET(req)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('valid123')
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost:3000/')
  })

  it('respects the ?next param on success', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null })

    const req = new Request('http://localhost:3000/auth/callback?code=abc&next=/dogs')
    const res = await GET(req)

    expect(res.headers.get('location')).toBe('http://localhost:3000/dogs')
  })

  it('redirects to /login?error=auth_callback_failed when exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: new Error('bad token') })

    const req = new Request('http://localhost:3000/auth/callback?code=expired')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?error=auth_callback_failed'
    )
  })

  it('redirects to /login?error=auth_callback_failed when no code is present', async () => {
    const req = new Request('http://localhost:3000/auth/callback')
    const res = await GET(req)

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?error=auth_callback_failed'
    )
  })
})
