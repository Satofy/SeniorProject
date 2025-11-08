"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: Array<"player" | "team_manager" | "admin">
}

export function ProtectedRoute({ children, requireAuth = true, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push("/login")
      } else if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
        router.push("/")
      }
    }
  }, [user, loading, requireAuth, allowedRoles, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
    return null
  }

  return <>{children}</>
}
