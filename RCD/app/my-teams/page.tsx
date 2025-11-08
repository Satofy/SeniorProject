"use client"

import { useEffect, useMemo, useState } from "react"
import { api, type Team, type User } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { Users, Shield, Crown, RefreshCcw, UserMinus } from "lucide-react"

type MemberWithTeamRole = User & { teamRole?: "player" | "admin" }

export default function MyTeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await api.getTeams()
      setTeams(data)
    } catch (e) {
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const myManagingTeams = useMemo(() => {
    if (!user) return [] as Team[]
    return teams.filter((t: Team) => t.managerId === user.id)
  }, [teams, user])

  const myMemberTeams = useMemo(() => {
    if (!user) return [] as Team[]
    return teams.filter(
      (t: Team) => t.managerId !== user.id && (t.members || []).some((m: User) => m.id === user.id),
    )
  }, [teams, user])

  const setLocalMemberRole = (teamId: string, memberId: string, role: MemberWithTeamRole["teamRole"]) => {
    setTeams((prev: Team[]) =>
      prev.map((t: Team) => {
        if (t.id !== teamId) return t
        const members = (t.members || []).map((m: User) =>
          m.id === memberId ? ({ ...m, role: role === "admin" ? "team_manager" : "player" } as User) : m,
        )
        return { ...t, members }
      }),
    )
  }

  const handleChangeRole = async (
    team: Team,
    member: User,
    newRole: "player" | "admin",
  ) => {
    // We interpret "admin" as team admin (team_manager) in the current global role model.
    const mappedRole: User["role"] = newRole === "admin" ? "team_manager" : "player"
    setUpdatingUserId(member.id)
    try {
      await api.changeUserRole(member.id, mappedRole)
      setLocalMemberRole(team.id, member.id, newRole)
      toast.success(`Updated ${member.email} to ${newRole}`)
    } catch (e: any) {
      toast.error(e?.message || "Failed to update role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleRemoveMember = async (team: Team, member: User) => {
    setUpdatingUserId(member.id)
    try {
      await api.removeTeamMember(team.id, member.id)
      setTeams((prev: Team[]) =>
        prev.map((t: Team) =>
          t.id === team.id ? { ...t, members: (t.members || []).filter((m: User) => m.id !== member.id) } : t,
        ),
      )
      toast.success("Member removed")
    } catch (e: any) {
      // Backend route may not exist yet; handle gracefully.
      toast.error(e?.message || "Remove member not available yet")
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-start md:items-center justify-between gap-4 mb-8 flex-col md:flex-row">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Teams</h1>
            <p className="text-muted-foreground">See teams you manage or belong to and manage member roles</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/teams">
                <Users className="w-4 h-4 mr-2" /> Browse Teams
              </Link>
            </Button>
            <Button variant="ghost" onClick={fetchTeams} disabled={loading}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Teams I manage */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" /> Teams I Manage
                </h2>
                <Badge variant="outline">{myManagingTeams.length}</Badge>
              </div>

              {myManagingTeams.length === 0 ? (
                <Card className="p-8 text-center">
                  <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">You're not managing any team yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create a team from the Teams page to become an owner</p>
                  <Button asChild>
                    <Link href="/teams">Go to Teams</Link>
                  </Button>
                </Card>
              ) : (
                <div className="space-y-6">
                  {myManagingTeams.map((team: Team) => (
                    <Card key={team.id} className="border-primary/20">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{team.name}</CardTitle>
                            <CardDescription>
                              {(team.members?.length || 0)} member{team.members?.length !== 1 ? "s" : ""}
                            </CardDescription>
                          </div>
                          {team.tag && <Badge variant="secondary">{team.tag}</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Separator />
                        <h4 className="font-medium">Members</h4>
                        {team.members && team.members.length > 0 ? (
                          <div className="space-y-2">
                            {(team.members as any[]).map((m: any, idx: number) => {
                              const member: User = typeof m === 'string' ? ({ id: m } as unknown as User) : (m as User)
                              const key = member.id || (member as any)._id || member.email || `member-${idx}`
                              return (
                              <div
                                key={String(key)}
                                className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Users className="w-4 h-4" />
                                  <div>
                                    <p className="font-medium">{member.email || 'Member'}</p>
                                    <p className="text-xs text-muted-foreground">ID: {member.id || (member as any)._id || 'unknown'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {member.id === team.managerId ? (
                                    <Badge variant="outline">
                                      <Shield className="w-3 h-3 mr-1" /> Owner
                                    </Badge>
                                  ) : (
                                    <>
                                      <Select
                                        disabled={updatingUserId === member.id}
                                        onValueChange={(val: string) =>
                                          handleChangeRole(team, member, val as "player" | "admin")
                                        }
                                        defaultValue={member.role === "team_manager" ? "admin" : "player"}
                                      >
                                        <SelectTrigger className="min-w-32">
                                          <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="player">Player</SelectItem>
                                          <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveMember(team, member)}
                                        disabled={updatingUserId === member.id}
                                        className="bg-transparent"
                                      >
                                        <UserMinus className="w-4 h-4 mr-1" /> Remove
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No members yet</p>
                        )}

                        <div className="pt-2">
                          <Button asChild variant="outline" className="bg-transparent">
                            <Link href={`/teams/${team.id}`}>Open Team Page</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Teams I'm in */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" /> Teams I'm In
                </h2>
                <Badge variant="outline">{myMemberTeams.length}</Badge>
              </div>

              {myMemberTeams.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium mb-1">You're not a member of any team yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Browse teams and send join requests</p>
                  <Button asChild>
                    <Link href="/teams">Find Teams</Link>
                  </Button>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myMemberTeams.map((team: Team) => (
                    <Card key={team.id} className="border-primary/20 hover:border-primary/40 transition-all">
                      <CardHeader>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription>
                          {(team.members?.length || 0)} member{team.members?.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/teams/${team.id}`}>View Team</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
