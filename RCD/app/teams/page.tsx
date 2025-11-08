"use client"

import { useEffect, useState } from "react"
import { api, type Team } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Users, Search, Plus, Shield } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamTag, setNewTeamTag] = useState("")
  const [creating, setCreating] = useState(false)

  const fetchTeams = async () => {
    try {
      const data = await api.getTeams()
      setTeams(data)
      setFilteredTeams(data)
    } catch (error) {
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      setFilteredTeams(
        teams.filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.tag?.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } else {
      setFilteredTeams(teams)
    }
  }, [searchQuery, teams])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required")
      return
    }

    setCreating(true)
    try {
      await api.createTeam(newTeamName, newTeamTag)
      toast.success("Team created successfully!")
      setShowCreateDialog(false)
      setNewTeamName("")
      setNewTeamTag("")
      fetchTeams()
    } catch (error: any) {
      toast.error(error.message || "Failed to create team")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Teams</h1>
          <p className="text-muted-foreground">Browse teams and join the competition</p>
        </div>
        {user && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>Start your own team and recruit players to compete together</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-tag">Team Tag (Optional)</Label>
                  <Input
                    id="team-tag"
                    placeholder="e.g., RCD"
                    value={newTeamTag}
                    onChange={(e) => setNewTeamTag(e.target.value)}
                    maxLength={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={creating}>
                  {creating ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search teams by name or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card
              key={team.id}
              className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg bg-card/50 backdrop-blur"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      {team.name}
                      {team.tag && (
                        <Badge variant="outline" className="text-xs">
                          {team.tag}
                        </Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription>
                  {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Manager: {team.managerId}</span>
                </div>
                {team.gamesPlayed !== undefined && (
                  <div className="text-sm text-muted-foreground">{team.gamesPlayed} games played</div>
                )}
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href={`/teams/${team.id}`}>View Team</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your search or create a new team</p>
          {user && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
