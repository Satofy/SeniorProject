"use client"

import { useEffect, useState } from "react"
import { api, type User, type Team, type Tournament } from "@/lib/api"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Users, Trophy, Trash2, Edit, Plus, Search } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

function AdminContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams?.get("tab") || "users"

  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAudit, setLoadingAudit] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [auditQuery, setAuditQuery] = useState("")
  const [visibleLogs, setVisibleLogs] = useState(20)

  // User management state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [newRole, setNewRole] = useState<User["role"]>("player")

  // Tournament management state
  const [showTournamentDialog, setShowTournamentDialog] = useState(false)
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null)
  const [tournamentForm, setTournamentForm] = useState({
    title: "",
    description: "",
    date: "",
    type: "single-elimination",
    status: "upcoming" as Tournament["status"],
    maxParticipants: "",
    prizePool: "",
    game: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersData, teamsData, tournamentsData, logsData] = await Promise.all([
        api.getUsers(),
        api.getTeams(),
        api.getTournaments(),
        api.getAuditLogs().catch(() => []),
      ])
      setUsers(usersData)
      setTeams(teamsData)
      setTournaments(tournamentsData)
  setAuditLogs(logsData)
  setLoadingAudit(false)
    } catch (error) {
      toast.error("Failed to load admin data")
    } finally {
      setLoading(false)
    }
  }

  const handleChangeUserRole = async () => {
    if (!selectedUser) return

    try {
      await api.changeUserRole(selectedUser.id, newRole)
      toast.success("User role updated successfully")
      setShowUserDialog(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to update user role")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await api.deleteUser(userId)
      toast.success("User deleted successfully")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user")
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return

    try {
      await api.deleteTeam(teamId)
      toast.success("Team deleted successfully")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team")
    }
  }

  const handleSaveTournament = async () => {
    if (!tournamentForm.title || !tournamentForm.date) {
      toast.error("Title and date are required")
      return
    }

    try {
      const data = {
        ...tournamentForm,
        maxParticipants: tournamentForm.maxParticipants ? Number.parseInt(tournamentForm.maxParticipants) : undefined,
      }

      if (editingTournament) {
        await api.updateTournament(editingTournament.id, data)
        toast.success("Tournament updated successfully")
      } else {
        await api.createTournament(data)
        toast.success("Tournament created successfully")
      }

      setShowTournamentDialog(false)
      setEditingTournament(null)
      setTournamentForm({
        title: "",
        description: "",
        date: "",
        type: "single-elimination",
        status: "upcoming",
        maxParticipants: "",
        prizePool: "",
        game: "",
      })
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to save tournament")
    }
  }

  const handleDeleteTournament = async (tournamentId: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return

    try {
      await api.deleteTournament(tournamentId)
      toast.success("Tournament deleted successfully")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tournament")
    }
  }

  const openEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament)
    setTournamentForm({
      title: tournament.title,
      description: tournament.description || "",
      date: tournament.date,
      type: (tournament.type || "single-elimination") as any,
      status: tournament.status,
      maxParticipants: tournament.maxParticipants?.toString() || "",
      prizePool: tournament.prizePool || "",
      game: tournament.game || "",
    })
    setShowTournamentDialog(true)
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredTeams = teams.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredTournaments = tournaments.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const [sortKey, setSortKey] = useState<'time' | 'action'>('time')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">Manage users, teams, tournaments, and system settings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 transition-transform duration-200 hover:scale-[1.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{users.length}</div>
            )}
          </CardContent>
        </Card>
  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 transition-transform duration-200 hover:scale-[1.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{teams.length}</div>
            )}
          </CardContent>
        </Card>
  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 transition-transform duration-200 hover:scale-[1.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-2xl font-bold">{tournaments.length}</div>
            )}
          </CardContent>
        </Card>
  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 transition-transform duration-200 hover:scale-[1.01]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {tournaments.filter((t) => t.status === "ongoing" || t.status === "upcoming").length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2" role="status" aria-live="polite">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.username || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.role.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.teamId || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setShowUserDialog(true)
                              }}
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Change Role
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive"
                              aria-label={`Delete user ${user.email}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Manage teams and their members</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2" role="status" aria-live="polite">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Games Played</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.tag ? <Badge variant="outline">{team.tag}</Badge> : "-"}</TableCell>
                        <TableCell>{team.members?.length || 0}</TableCell>
                        <TableCell>{team.gamesPlayed || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTeam(team.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tournament Management</CardTitle>
                  <CardDescription>Create and manage tournaments</CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tournaments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={() => setShowTournamentDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tournament
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2" role="status" aria-live="polite">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTournaments.map((tournament) => (
                      <TableRow key={tournament.id}>
                        <TableCell className="font-medium">{tournament.title}</TableCell>
                        <TableCell>{new Date(tournament.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tournament.status === "upcoming"
                                ? "default"
                                : tournament.status === "ongoing"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {tournament.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tournament.currentParticipants || 0}
                          {tournament.maxParticipants ? ` / ${tournament.maxParticipants}` : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditTournament(tournament)}>
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTournament(tournament.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>View system activity and user actions</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    className="pl-10"
                    aria-label="Search audit logs"
                  />
                </div>
                <div className="flex items-center gap-2" aria-label="Sort logs">
                  <Label htmlFor="sortKey" className="sr-only">Sort by</Label>
                  <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
                    <SelectTrigger id="sortKey" className="w-[140px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Desc</SelectItem>
                      <SelectItem value="asc">Asc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAudit ? (
                <div className="space-y-3" role="status" aria-live="polite">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : auditLogs.length > 0 ? (
                <Table aria-label="Audit log table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs
                      .slice()
                      .filter((log) =>
                        (log.user || '').toLowerCase().includes(auditQuery.toLowerCase()) ||
                        (log.action || '').toLowerCase().includes(auditQuery.toLowerCase()) ||
                        (log.details || '').toLowerCase().includes(auditQuery.toLowerCase())
                      )
                      .sort((a, b) => {
                        if (sortKey === 'action') {
                          const A = (a.action || '').localeCompare(b.action || '')
                          return sortDir === 'asc' ? A : -A
                        }
                        const at = new Date(a.timestamp).getTime()
                        const bt = new Date(b.timestamp).getTime()
                        return sortDir === 'asc' ? at - bt : bt - at
                      })
                      .slice(0, visibleLogs)
                      .map((log, index) => (
                        <TableRow key={index}>
                          <TableCell title={new Date(log.timestamp).toLocaleString()}>
                            {formatRelativeTime(log.timestamp)}
                          </TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.action?.includes('delete')
                                  ? 'destructive'
                                  : log.action?.includes('create')
                                    ? 'default'
                                    : log.action?.includes('update') || log.action?.includes('approve')
                                      ? 'secondary'
                                      : 'outline'
                              }
                              className="capitalize"
                              aria-label={`Action ${log.action}`}
                            >
                              {log.action?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{log.details}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No audit logs available</p>
                </div>
              )}
              {!loadingAudit && auditLogs.filter((log) =>
                  (log.user || '').toLowerCase().includes(auditQuery.toLowerCase()) ||
                  (log.action || '').toLowerCase().includes(auditQuery.toLowerCase()) ||
                  (log.details || '').toLowerCase().includes(auditQuery.toLowerCase())
                ).length > visibleLogs && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => setVisibleLogs((v) => v + 20)}>
                    Load more
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change User Role Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update the role for {selectedUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="role">Select Role</Label>
            <Select value={newRole} onValueChange={(value) => setNewRole(value as User["role"])}>
              <SelectTrigger id="role" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="team_manager">Team Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeUserRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Tournament Dialog */}
      <Dialog open={showTournamentDialog} onOpenChange={setShowTournamentDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTournament ? "Edit Tournament" : "Create Tournament"}</DialogTitle>
            <DialogDescription>
              {editingTournament ? "Update tournament details" : "Fill in the tournament information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={tournamentForm.title}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, title: e.target.value })}
                  placeholder="Tournament name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={tournamentForm.date}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={tournamentForm.description}
                onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                placeholder="Tournament description"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={tournamentForm.type}
                  onValueChange={(value) => setTournamentForm({ ...tournamentForm, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-elimination">Single Elimination</SelectItem>
                    <SelectItem value="double-elimination">Double Elimination</SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={tournamentForm.status}
                  onValueChange={(value) =>
                    setTournamentForm({ ...tournamentForm, status: value as Tournament["status"] })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Input
                  id="game"
                  value={tournamentForm.game}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, game: e.target.value })}
                  placeholder="e.g., Rocket League"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={tournamentForm.maxParticipants}
                  onChange={(e) => setTournamentForm({ ...tournamentForm, maxParticipants: e.target.value })}
                  placeholder="e.g., 32"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizePool">Prize Pool</Label>
              <Input
                id="prizePool"
                value={tournamentForm.prizePool}
                onChange={(e) => setTournamentForm({ ...tournamentForm, prizePool: e.target.value })}
                placeholder="e.g., $10,000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTournamentDialog(false)
                setEditingTournament(null)
                setTournamentForm({
                  title: "",
                  description: "",
                  date: "",
                  type: "single-elimination",
                  status: "upcoming",
                  maxParticipants: "",
                  prizePool: "",
                  game: "",
                })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTournament}>
              {editingTournament ? "Update Tournament" : "Create Tournament"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <AdminContent />
    </ProtectedRoute>
  )
}
