import { sanitizeUser as __test__sanitizeUser } from '../lib/auth-sanitize'

describe('sanitizeUser', () => {
  it('removes sensitive fields', () => {
    const input: any = {
      id: '123',
      email: 'test@example.com',
      role: 'player',
      token: 'abc',
      password: 'secret',
      passwordHash: 'hash',
      refreshToken: 'rt'
    }
    const result = __test__sanitizeUser(input) as any
    expect(result.id).toBe('123')
    expect(result.email).toBe('test@example.com')
    expect(result.role).toBe('player')
    expect(result.token).toBeUndefined()
    expect(result.password).toBeUndefined()
    expect(result.passwordHash).toBeUndefined()
    expect(result.refreshToken).toBeUndefined()
  })

  it('returns null when input null', () => {
    expect(__test__sanitizeUser(null)).toBeNull()
  })
})
