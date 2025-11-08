import type { User } from './api'

// Standalone, testable helper to strip sensitive fields from a user object
export function sanitizeUser(u: any | null): User | null {
  if (!u) return null
  const clone: any = { ...u }
  delete clone.token
  delete clone.password
  delete clone.passwordHash
  delete clone.refreshToken
  return clone as User
}
