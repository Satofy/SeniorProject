"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { api, type User } from "./api"
import { sanitizeUser } from './auth-sanitize'

type AuthContextValue = {
  user: User | null
  loading: boolean
  // role helpers used across the app
  isPlayer: boolean
  isTeamManager: boolean
  isAdmin: boolean
  // actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // sanitize handled by standalone helper

  const fetchUser = async () => {
    try {
      const u = await api.getCurrentUser()
      setUser(sanitizeUser(u))
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    const token = typeof window !== 'undefined' ? localStorage.getItem('rcd_token') : null
    if (!token) {
      setLoading(false)
      return
    }
    api
      .getCurrentUser()
      .then((u) => mounted && setUser(sanitizeUser(u)))
      .catch(() => mounted && setUser(null))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { user: u } = await api.login(email, password)
    setUser(sanitizeUser(u))
  }

  const register = async (email: string, password: string, username?: string) => {
    const { user: u } = await api.register(email, password, username)
    setUser(sanitizeUser(u))
  }

  const logout = () => {
    api.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const roleFlags = useMemo(() => {
    const role = user?.role
    return {
      isPlayer: role === 'player',
      isTeamManager: role === 'team_manager',
      isAdmin: role === 'admin',
    }
  }, [user?.role])

  return (
  <AuthContext.Provider aria-live="polite" value={{ user, loading, ...roleFlags, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Export a testable helper for unit tests without exposing context internals
// test helper moved to lib/auth-sanitize.ts
