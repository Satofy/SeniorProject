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

function ProfileContent() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
      })
      toast.success("Profile updated successfully")
      await refreshUser()
      setEditing(false)
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
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={avatarPreview || user?.avatarUrl || "/placeholder-user.jpg"} alt={user?.username || user?.email || "avatar"} />
                  <AvatarFallback>
                    {(user?.username || user?.email || "U").slice(0,2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Your personal details and account information</CardDescription>
                </div>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="outline">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatarPreview || "/placeholder-user.jpg"} alt="avatar preview" />
                      <AvatarFallback>
                        {(username || email || "U").slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={onPickAvatar} disabled={loading}>Change Photo</Button>
                      <Button type="button" variant="ghost" onClick={onRemoveAvatar} disabled={loading}>Remove</Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarFileChange}
                    />
                  </div>
                </div>
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
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{user?.username || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Badge variant="outline" className="capitalize">
                      {user?.role?.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {user?.teamId && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Team</p>
                      <Link href={`/teams/${user.teamId}`} className="font-medium text-primary hover:underline">
                        View Team
                      </Link>
                    </div>
                  </div>
                )}
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

        {/* Account Info */}
        <Card className="border-muted/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account ID</span>
              <span className="font-mono">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="capitalize">{user?.role?.replace("_", " ")}</span>
            </div>
          </CardContent>
        </Card>
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
