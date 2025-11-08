"use client"

import { useEffect, useMemo, useState } from "react"
import { api, type Team, type User } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import Link from "next/link"
import { Users, Crown, RefreshCcw, ExternalLink, Trash2 } from "lucide-react"
import { useNotifications } from "@/lib/notifications-context"

interface EnrichedTeam extends Team {
  memberObjects: Array<{ id: string; email?: string; username?: string; role?: User['role'] }>
  pendingRequests?: Array<{ id: string; userId: string; user?: { id: string; email?: string; username?: string }; message?: string; createdAt: string }>
}

function RoleSelect({ value, onChange, disabled }: { value: User['role']; onChange: (v: User['role']) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as User['role'])} disabled={disabled}>
      <SelectTrigger size="sm" className="min-w-[90px]" disabled={disabled}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="player">Player</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}

function TeamsManagerView() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState<EnrichedTeam[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const managedTeams = useMemo(() => teams.filter(t => t.managerId === user?.id), [teams, user?.id])
  const memberTeams = useMemo(() => teams.filter(t => t.managerId !== user?.id && t.memberObjects.some(m => m.id === user?.id)), [teams, user?.id])

  const load = async () => {
    if (!user) return
    setLoading(true)
    try {
      const list = await api.getTeams()
      const enriched: EnrichedTeam[] = []
      for (const t of list) {
        let full: EnrichedTeam = { ...t, memberObjects: [], pendingRequests: t.pendingRequests }
        try {
          // fetch fresh detail to get pending requests & normalized members
          const detail = await api.getTeam(t.id)
          full = { ...detail, memberObjects: (detail.members || []).map(m => typeof m === 'string' ? { id: m } : m) } as EnrichedTeam
        } catch {}
        enriched.push(full)
      }
      setTeams(enriched)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user?.id])

  const doRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const updateRole = async (team: EnrichedTeam, memberId: string, role: User['role']) => {
    try {
      await api.updateTeamMemberRole(team.id, memberId, role)
      addNotification({ type: 'success', message: 'Role updated', actionLabel: 'View team', onAction: () => window.location.href = `/teams/${team.id}` })
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, memberObjects: t.memberObjects.map(m => m.id === memberId ? { ...m, role } : m) } : t))
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update role')
    }
  }

  const removeMember = async (team: EnrichedTeam, memberId: string) => {
    try {
      await api.removeTeamMember(team.id, memberId)
      toast.success('Member removed')
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, memberObjects: t.memberObjects.filter(m => m.id !== memberId) } : t))
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove member')
    }
  }

  const leaveTeam = async (team: EnrichedTeam) => {
    try {
      await api.leaveTeam(team.id)
      toast.success('Left team')
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, memberObjects: t.memberObjects.filter(m => m.id !== user?.id) } : t))
    } catch (e: any) {
      toast.error(e?.message || 'Failed to leave team')
    }
  }

  const approveReq = async (team: EnrichedTeam, reqId: string) => {
    try {
      await api.approveJoinRequest(team.id, reqId)
      toast.success('Request approved')
      addNotification({ type: 'success', message: 'Join request approved' })
      await doRefresh()
    } catch (e: any) { toast.error(e?.message || 'Failed to approve') }
  }
  const declineReq = async (team: EnrichedTeam, reqId: string) => {
    try {
      await api.declineJoinRequest(team.id, reqId)
      toast.success('Request declined')
      addNotification({ type: 'info', message: 'Join request declined' })
      await doRefresh()
    } catch (e: any) { toast.error(e?.message || 'Failed to decline') }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
            <h1 className="text-4xl font-bold mb-2">My Teams</h1>
            <p className="text-muted-foreground">See teams you manage or belong to and manage member roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/teams'}>Browse Teams</Button>
          <Button variant="outline" onClick={doRefresh} disabled={refreshing}>
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" style={{ animationPlayState: refreshing ? 'running' : 'paused' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Teams I Manage */}
      <div className="space-y-4 mb-12">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Teams I Manage</h2>
          <Badge variant="outline">{managedTeams.length}</Badge>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : managedTeams.length === 0 ? (
          <Card className="p-6 text-center"><p className="text-sm text-muted-foreground">You don't manage any teams yet</p></Card>
        ) : (
          <div className="space-y-6">
            {managedTeams.map(team => (
              <Card key={team.id} className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-2xl">{team.name}{team.tag && <Badge variant="outline" className="text-xs">{team.tag}</Badge>}</CardTitle>
                      <CardDescription>{team.memberObjects.length} member{team.memberObjects.length !== 1 ? 's' : ''}</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button asChild size="sm" variant="outline"><Link href={`/teams/${team.id}`}><ExternalLink className="w-4 h-4 mr-1" /> Open Team Page</Link></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pending Requests */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm flex items-center gap-2">Pending Requests <Badge variant="outline">{team.pendingRequests?.length || 0}</Badge></h3>
                      <Button size="sm" variant="ghost" onClick={doRefresh}>Reload</Button>
                    </div>
                    {team.pendingRequests && team.pendingRequests.length > 0 ? (
                      <div className="space-y-2">
                        {team.pendingRequests.map(r => (
                          <div key={r.id} className="flex items-center justify-between p-3 rounded-md bg-muted/40">
                            <div>
                              <p className="text-sm font-medium">{r.user?.email || r.user?.username || r.userId}</p>
                              {r.message && <p className="text-xs text-muted-foreground line-clamp-1">{r.message}</p>}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => approveReq(team, r.id)}>Approve</Button>
                              <Button size="sm" variant="outline" onClick={() => declineReq(team, r.id)}>Decline</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No pending requests</p>
                    )}
                  </div>

                  <Separator />

                  {/* Members */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Members</h3>
                    {team.memberObjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No members yet</p>
                    ) : (
                      <div className="space-y-2">
                        {team.memberObjects.map(m => (
                          <div key={m.id} className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-md">
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate" title={m.email || m.id}>{m.username || m.email || m.id}</p>
                              <p className="text-xs text-muted-foreground">ID: {m.id}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <RoleSelect value={(m.role || 'player') as User['role']} onChange={(role) => updateRole(team, m.id, role)} disabled={m.id === team.managerId} />
                              {m.id !== team.managerId && (
                                <Button size="sm" variant="outline" onClick={() => removeMember(team, m.id)}>
                                  <Trash2 className="w-4 h-4 mr-1" /> Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Teams I'm In */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Teams I'm In</h2>
          <Badge variant="outline">{memberTeams.length}</Badge>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : memberTeams.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">You're not a member of any team yet</p>
            <Button asChild>
              <Link href="/teams">Find Teams</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {memberTeams.map(team => (
              <Card key={team.id} className="border-muted/40">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">{team.name}{team.tag && <Badge variant="outline" className="text-xs">{team.tag}</Badge>}</CardTitle>
                      <CardDescription>{team.memberObjects.length} members</CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button asChild size="sm" variant="outline"><Link href={`/teams/${team.id}`}><ExternalLink className="w-4 h-4 mr-1" /> Open Team Page</Link></Button>
                      <Button size="sm" variant="outline" onClick={() => leaveTeam(team)}>Leave Team</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {team.memberObjects.map(m => (
                      <span key={m.id} className="px-2 py-1 rounded bg-muted/30">{m.username || m.email || m.id}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyTeamsPage() {
  return (
    <ProtectedRoute requireAuth>
      <TeamsManagerView />
    </ProtectedRoute>
  )
}
