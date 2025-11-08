"use client"

import { useEffect, useState } from "react"
import { api, type Tournament } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Trophy, Calendar, Users, Search, Plus } from "lucide-react"
import { GameBadge } from "@/components/game-badge"
import { toast } from "sonner"

export default function TournamentsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // First try your backend API
        let data = await api.getTournaments()

        // If empty, fall back to PandaScore proxy (e.g., Valorant)
        if (!data || data.length === 0) {
          const pandaData = await api.getPandaTournaments({ game: "valorant", perPage: 24 })
          if (pandaData.length > 0) {
            data = pandaData
            toast.success("Loaded live tournaments from PandaScore")
          }
        }

        setTournaments(data)
        setFilteredTournaments(data)
      } catch (error) {
        toast.error("Failed to load tournaments")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  useEffect(() => {
    let filtered = tournaments

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    setFilteredTournaments(filtered)
  }, [searchQuery, statusFilter, tournaments])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Tournaments</h1>
          <p className="text-muted-foreground">Browse and join competitive tournaments</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin?tab=tournaments">
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tournament Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Card
              key={tournament.id}
              className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg bg-card/50 backdrop-blur"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl line-clamp-1">{tournament.title}</CardTitle>
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
                </div>
                <CardDescription className="line-clamp-2">{tournament.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(tournament.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {tournament.game && <GameBadge game={tournament.game} />}
                  {tournament.maxParticipants && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {tournament.currentParticipants || 0} / {tournament.maxParticipants} participants
                    </div>
                  )}
                  {tournament.prizePool && (
                    <div className="text-sm font-semibold text-primary">{tournament.prizePool} Prize Pool</div>
                  )}
                </div>
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href={`/tournaments/${tournament.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}
