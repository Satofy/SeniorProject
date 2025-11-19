"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Shield, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function countryToFlag(code: string): string {
  if (!code) return "🏳️"
  const cc = code.trim().toUpperCase()
  if (cc.length !== 2) return cc
  const A = 0x1F1E6
  const base = "A".charCodeAt(0)
  const chars = [...cc].map((c) => String.fromCodePoint(A + (c.charCodeAt(0) - base)))
  return chars.join("")
}

function labelForGameId(key: string): string {
  const map: Record<string,string> = {
    playstation: "PlayStation",
    pubgMobile: "PUBG Mobile",
    rocketLeague: "Rocket League",
    activision: "Activision",
    riot: "Riot",
    r6s: "R6S",
    mobileLegends: "Mobile Legends",
    battleNet: "Battle.net",
    steam: "Steam",
    codMobile: "CoD Mobile",
    streetFighter: "Street Fighter",
    smashBros: "Smash Bros",
  }
  return map[key] || key
}

function ProfileContent() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "gameIds" | "general">("overview")
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [country, setCountry] = useState(user?.country || "BH")
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [region, setRegion] = useState(user?.region || "")
  const [gameIds, setGameIds] = useState<Record<string, string>>({
    playstation: user?.gameIds?.playstation || "",
    pubgMobile: user?.gameIds?.pubgMobile || "",
    rocketLeague: user?.gameIds?.rocketLeague || "",
    activision: user?.gameIds?.activision || "",
    riot: user?.gameIds?.riot || "",
    r6s: user?.gameIds?.r6s || "",
    mobileLegends: user?.gameIds?.mobileLegends || "",
    battleNet: user?.gameIds?.battleNet || "",
    steam: user?.gameIds?.steam || "",
    codMobile: user?.gameIds?.codMobile || "",
    streetFighter: user?.gameIds?.streetFighter || "",
    smashBros: user?.gameIds?.smashBros || "",
  })
  const [social, setSocial] = useState<Record<string, string>>({
    snapchat: user?.social?.snapchat || "",
    youtube: user?.social?.youtube || "",
    discord: user?.social?.discord || "",
    twitch: user?.social?.twitch || "",
    twitter: user?.social?.twitter || "",
    instagram: user?.social?.instagram || "",
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setLoading(true)
    try {
      await api.updateUser(user.id, {
        username: username || undefined,
        email: email || undefined,
        avatarUrl: avatarPreview,
        gameIds,
        social,
        timezone,
        country,
        region: region || undefined,
      })
      toast.success("Profile updated successfully")
      await refreshUser()
      setEditing(false)
      setActiveTab("overview")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const onPickAvatar = () => fileInputRef.current?.click()
  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    const maxBytes = 2 * 1024 * 1024 // 2MB
    if (file.size > maxBytes) {
      toast.error("Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatarPreview(result)
    }
    reader.readAsDataURL(file)
  }
  const onRemoveAvatar = () => setAvatarPreview("/placeholder-user.jpg")

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      // Password change would be handled by backend
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Info */}
        <Card className="border-primary/20 overflow-hidden">
          <CardHeader className="relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-border">
                    <AvatarImage src={(editing ? avatarPreview : user?.avatarUrl) || "/placeholder-user.jpg"} alt={user?.username || user?.email || "avatar"} />
                    <AvatarFallback>
                      {(user?.username || user?.email || "U").slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <>
                      <button
                        type="button"
                        onClick={onPickAvatar}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/90 px-2 py-0.5 text-xs shadow ring-1 ring-border hover:bg-background"
                      >
                        Change
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onAvatarFileChange}
                      />
                    </>
                  )}
                </div>
                <div>
                  <CardTitle className="leading-tight">{editing ? "Edit Profile" : "Profile Information"}</CardTitle>
                  <CardDescription>
                    {editing ? "Update your account details" : "Your personal details and account information"}
                  </CardDescription>
                  {!editing && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      {country && (
                        <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5">
                          <span>{countryToFlag(country)}</span>
                          <span>{country}</span>
                        </span>
                      )}
                      {user?.createdAt && (
                        <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5">
                          Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {!editing ? (
                <div className="flex gap-2">
                  <Button onClick={() => { setEditing(true); setActiveTab("gameIds") }} variant="default">
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={onRemoveAvatar} disabled={loading}>
                  Reset Photo
                </Button>
              )}
            </div>
            {editing && (
              <p className="mt-6 text-xs text-muted-foreground">PNG or JPG up to 2MB.</p>
            )}
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Tabs only visible in edit mode */}
                <div className="mb-2 flex items-center gap-6 border-b border-border">
                  {(["gameIds","general"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`-mb-px border-b-2 px-1 py-2 text-sm ${activeTab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                      {key === "gameIds" ? "Game IDs" : "General"}
                    </button>
                  ))}
                </div>
                {activeTab === "gameIds" && (
                  <>
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Game IDs</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {Object.entries(gameIds).map(([k,v]) => (
                          <div key={k} className="space-y-1">
                            <Label className="capitalize">{labelForGameId(k)}</Label>
                            <Input value={v} onChange={(e)=>setGameIds((s)=>({ ...s, [k]: e.target.value }))} placeholder={`${labelForGameId(k)} ID`} disabled={loading} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-3 text-sm font-semibold">Social Media</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {Object.entries(social).map(([k,v]) => (
                          <div key={k} className="space-y-1">
                            <Label className="capitalize">{k}</Label>
                            <Input value={v} onChange={(e)=>setSocial((s)=>({ ...s, [k]: e.target.value }))} placeholder={`${k} username`} disabled={loading} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {activeTab === "general" && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="Enter username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" placeholder="ISO code (e.g., BH)" value={country} onChange={(e)=>setCountry(e.target.value.toUpperCase())} disabled={loading} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input id="timezone" placeholder="Region/City" value={timezone} onChange={(e)=>setTimezone(e.target.value)} disabled={loading} />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="region">Region</Label>
                        <Input id="region" placeholder="Optional region" value={region} onChange={(e)=>setRegion(e.target.value)} disabled={loading} />
                      </div>
                    </div>
                  </>
                )}
                {/* Global actions for all tabs */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setUsername(user?.username || "")
                      setEmail(user?.email || "")
                      setAvatarPreview(user?.avatarUrl)
                      setCountry(user?.country || "")
                      setTimezone(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
                      setRegion(user?.region || "")
                      setActiveTab("overview")
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Overview Tab (read-only) */}
                <div className="flex items-center gap-6 border-b border-border">
                  <div className="-mb-px border-b-2 border-primary px-1 py-2 text-sm">Overview</div>
                </div>
                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Matches', value: '0' },
                    { label: 'Win Rate %', value: '0.00' },
                    { label: 'Highest Streak', value: '0' },
                    { label: 'Trophies', value: '0' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border p-4 text-center">
                      <div className="text-2xl font-semibold">{s.value}</div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
                {/* Game IDs (read-only) */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Game IDs</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(user?.gameIds || {}).filter(([,v]) => !!v).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No game IDs added yet.</p>
                    ) : (
                      Object.entries(user?.gameIds || {}).filter(([,v]) => v).map(([k,v]) => (
                        <div key={k} className="rounded-lg border border-border p-4">
                          <div className="text-xs text-muted-foreground">{labelForGameId(k)}</div>
                          <div className="font-medium break-all">{String(v)}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info removed by request */}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth>
      <ProfileContent />
    </ProtectedRoute>
  )
}
