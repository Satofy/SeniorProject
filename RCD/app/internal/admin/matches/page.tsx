"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MatchCard } from "../../../../InternalSystem/components/admin/match-card"
import { Plus, Search } from "lucide-react"

interface Match {
  id: number
  tournament: string
  team1: string
  team2: string
  score1: number
  score2: number
  date: string
  time: string
  status: "upcoming" | "live" | "completed"
  stage: string
}

const mockMatches: Match[] = [
  {
    id: 1,
    tournament: "Valorant Woman",
    team1: "Phoenix Rising",
    team2: "Diamond Squad",
    score1: 2,
    score2: 1,
    date: "Nov 15, 2024",
    time: "19:00",
    status: "completed",
    stage: "Group Stage",
  },
  {
    id: 2,
    tournament: "Valorant Woman",
    team1: "Shadow Legends",
    team2: "Echo Force",
    score1: 0,
    score2: 0,
    date: "Nov 16, 2024",
    time: "18:30",
    status: "upcoming",
    stage: "Group Stage",
  },
  {
    id: 3,
    tournament: "Overwatch 2",
    team1: "Titan Strike",
    team2: "Apex Wolves",
    score1: 2,
    score2: 2,
    date: "Nov 16, 2024",
    time: "20:00",
    status: "live",
    stage: "Quarter Finals",
  },
]

export default function InternalMatchesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = mockMatches.filter((match) => {
    const matchesSearch =
      match.team1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.team2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.tournament.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || match.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Matches</h2>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus size={20} />
            Create Match
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search teams or tournament..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-md bg-card border border-border text-foreground cursor-pointer"
          >
            <option value="all">All Matches</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  )
}
