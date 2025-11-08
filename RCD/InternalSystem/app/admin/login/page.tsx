"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate authentication - in production, connect to your auth system
    if (email && password.length >= 6) {
      // Store admin session
      localStorage.setItem("adminAuth", JSON.stringify({ email, authenticated: true }))
      router.push("/admin/dashboard")
    } else {
      setError("Invalid credentials. Admin access only.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">E</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">Esports Tournament Management System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="admin@esports.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 bg-input border-border text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-input border-border text-foreground"
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Signing in..." : "Sign in as Admin"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            This is a restricted admin area. Privileged users only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
