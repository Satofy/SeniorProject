"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, type User } from "./api"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAdmin: boolean
  isTeamManager: boolean
  isPlayer: boolean
  isGuest: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const currentUser = await api.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
      if (typeof window !== "undefined") {
        localStorage.removeItem("rcd_token")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("rcd_token")) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { user: loggedInUser } = await api.login(email, password)
    setUser(loggedInUser)
    router.push("/dashboard")
  }

  const register = async (email: string, password: string, username?: string) => {
    const { user: registeredUser } = await api.register(email, password, username)
    setUser(registeredUser)
    router.push("/dashboard")
  }

  const logout = () => {
    api.logout()
    setUser(null)
    router.push("/")
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const isAdmin = user?.role === "admin"
  const isTeamManager = user?.role === "team_manager"
  const isPlayer = user?.role === "player"
  const isGuest = !user || user?.role === "guest"

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin,
        isTeamManager,
        isPlayer,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
