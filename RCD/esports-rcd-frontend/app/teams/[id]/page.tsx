"use client"

import { useEffect, useState } from "react"
import { api, type Team } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Shield, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { GameBadge } from "@/components/game-badge"

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isPlayer } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [pending, setPending] = useState<Array<{ id: string; userId: string; user?: { id: string; email?: string; username?: string }; message?: string; createdAt: string }>>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    const id = (params as any)?.id
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.getTeam(String(id))
        if (!cancelled) setTeam(data)
        if (!cancelled && user && data && user.id === data.managerId) {
          setLoadingRequests(true)
          try {
            const reqs = await api.getTeamRequests(String(id))
            if (!cancelled) setPending(reqs)
          } finally {
            if (!cancelled) setLoadingRequests(false)
          }
        }
      } catch (error) {
        toast.error("Failed to load team")
        if (!cancelled) router.push("/teams")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params, router])

  const handleRequestToJoin = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    setRequesting(true)
    try {
      const id = (params as any)?.id
      if (!id) {
        toast.error("Missing team id")
        setRequesting(false)
        return
      }
      await api.requestToJoinTeam(String(id))
      toast.success("Join request sent successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send join request")
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!team) {
    return null
  }

  const isManager = user?.id === team.managerId

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Teams
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    {team.name}
                    {team.tag && (
                      <Badge variant="outline" className="text-base">
                        {team.tag}
                      </Badge>
                    )}
                  </CardTitle>
                  {isManager && (
                    <Badge variant="secondary" className="mt-2">
                      <Shield className="w-3 h-3 mr-1" />
                      You manage this team
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="text-base">
                {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {team.games && team.games.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {team.games.map((g) => (
                    <GameBadge key={g} game={g} />
                  ))}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {team.gamesPlayed !== undefined && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Games Played</p>
                    <p className="text-2xl font-bold">{team.gamesPlayed}</p>
                  </div>
                )}
                {team.balance !== undefined && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Team Balance</p>
                    <p className="text-2xl font-bold">${team.balance}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                {team.members && team.members.length > 0 ? (
                  <div className="space-y-2">
                    {team.members.map((m) => {
                      const member = typeof m === 'string' ? { id: m, email: m, role: 'player' } : m
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{member.email || member.id}</p>
                            <p className="text-sm text-muted-foreground capitalize">{member.role || 'player'}</p>
                          </div>
                          {member.id === team.managerId && (
                            <Badge variant="outline">
                              <Shield className="w-3 h-3 mr-1" />
                              Manager
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No members yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {isManager && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRequests ? (
                  <div className="text-sm text-muted-foreground">Loading requests...</div>
                ) : pending.length > 0 ? (
                  <div className="space-y-3">
                    {pending.map((r) => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                        <div>
                          <div className="font-medium">{r.user?.email || r.user?.username || r.userId}</div>
                          {r.message && <div className="text-xs text-muted-foreground">{r.message}</div>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              await api.approveJoinRequest(team.id, r.id)
                              setPending((prev) => prev.filter((x) => x.id !== r.id))
                              toast.success('Request approved')
                            } catch (e: any) {
                              toast.error(e?.message || 'Failed to approve')
                            }
                          }}>Approve</Button>
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              await api.declineJoinRequest(team.id, r.id)
                              setPending((prev) => prev.filter((x) => x.id !== r.id))
                              toast.success('Request declined')
                            } catch (e: any) {
                              toast.error(e?.message || 'Failed to decline')
                            }
                          }}>Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                )}
              </CardContent>
            </Card>
          )}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Join Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  {isManager ? (
                    <p className="text-sm text-muted-foreground text-center">You manage this team</p>
                  ) : isPlayer ? (
                    <Button onClick={handleRequestToJoin} disabled={requesting} className="w-full" size="lg">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {requesting ? "Sending..." : "Request to Join"}
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Only players can join teams</p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">Sign in to request to join this team</p>
                  <Button asChild className="w-full" size="lg">
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Team Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Members</span>
                <span className="font-medium">{team.members?.length || 0}</span>
              </div>
              {team.gamesPlayed !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-medium">{team.gamesPlayed}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
