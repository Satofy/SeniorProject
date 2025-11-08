"use client"

import { useEffect, useState } from "react"
import { api, type Tournament, type Team, type JoinRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Trophy, Users, Calendar, TrendingUp, CheckCircle, XCircle, UserMinus } from "lucide-react"
import { toast } from "sonner"

function DashboardContent() {
  const { user, isPlayer, isTeamManager, isAdmin } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [team, setTeam] = useState<Team | null>(null)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentsData = await api.getTournaments()
        setTournaments(tournamentsData.filter((t) => t.status === "upcoming").slice(0, 5))

        if (user?.teamId) {
          const teamData = await api.getTeam(user.teamId)
          setTeam(teamData)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleApproveRequest = async (requestId: string) => {
    if (!team) return
    try {
      await api.approveJoinRequest(team.id, requestId)
      toast.success("Join request approved")
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId))
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request")
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    if (!team) return
    try {
      await api.declineJoinRequest(team.id, requestId)
      toast.success("Join request declined")
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId))
    } catch (error: any) {
      toast.error(error.message || "Failed to decline request")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username || user?.email}
          <Badge variant="outline" className="ml-3 capitalize">
            {user?.role?.replace("_", " ")}
          </Badge>
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tournaments</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tournaments.length}</div>
            <p className="text-xs text-muted-foreground">Available to join</p>
          </CardContent>
        </Card>

        {isTeamManager && team && (
          <>
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{team.members?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{team.gamesPlayed || 0}</div>
                <p className="text-xs text-muted-foreground">Total matches</p>
              </CardContent>
            </Card>
          </>
        )}

        {isPlayer && (
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Team</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.teamId ? "1" : "0"}</div>
              <p className="text-xs text-muted-foreground">{user?.teamId ? "Team joined" : "No team yet"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tournaments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          {isTeamManager && <TabsTrigger value="team">Team Management</TabsTrigger>}
          {isPlayer && <TabsTrigger value="activity">My Activity</TabsTrigger>}
        </TabsList>

        <TabsContent value="tournaments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tournaments</CardTitle>
              <CardDescription>Browse and register for upcoming competitions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : tournaments.length > 0 ? (
                <div className="space-y-3">
                  {tournaments.map((tournament) => (
                    <div
                      key={tournament.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/40 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{tournament.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(tournament.date).toLocaleDateString()}
                          </span>
                          {tournament.prizePool && (
                            <span className="flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {tournament.prizePool}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No upcoming tournaments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isTeamManager && (
          <TabsContent value="team" className="space-y-4">
            {team ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{team.name}</CardTitle>
                        <CardDescription>Manage your team and members</CardDescription>
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/teams/${team.id}`}>View Team Page</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Team Balance</p>
                        <p className="text-2xl font-bold">${team.balance || 0}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Total Games</p>
                        <p className="text-2xl font-bold">{team.gamesPlayed || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Join Requests</CardTitle>
                    <CardDescription>Approve or decline players wanting to join your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {joinRequests.length > 0 ? (
                      <div className="space-y-3">
                        {joinRequests.map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-4 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{request.user?.email || "Unknown User"}</p>
                              <p className="text-sm text-muted-foreground">
                                Requested {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-transparent"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineRequest(request.id)}
                                className="bg-transparent"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No pending join requests</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team roster</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {team.members && team.members.length > 0 ? (
                      <div className="space-y-2">
                        {team.members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border border-border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{member.email}</p>
                              <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            </div>
                            {member.id !== team.managerId && (
                              <Button size="sm" variant="outline" className="bg-transparent">
                                <UserMinus className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No team members yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Team Yet</h3>
                  <p className="text-muted-foreground mb-4">Create a team to start managing members and competing</p>
                  <Button asChild>
                    <Link href="/teams">Browse Teams</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {isPlayer && (
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Tournaments</CardTitle>
                <CardDescription>Tournaments you've registered for</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tournaments joined yet</p>
                  <Button asChild className="mt-4 bg-transparent" variant="outline">
                    <Link href="/tournaments">Browse Tournaments</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Team</CardTitle>
                <CardDescription>Your current team affiliation</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.teamId ? (
                  <div className="p-4 border border-border rounded-lg">
                    <p className="font-medium mb-2">Team ID: {user.teamId}</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/teams/${user.teamId}`}>View Team</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">You're not part of a team yet</p>
                    <Button asChild className="mt-4 bg-transparent" variant="outline">
                      <Link href="/teams">Browse Teams</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth>
      <DashboardContent />
    </ProtectedRoute>
  )
}
