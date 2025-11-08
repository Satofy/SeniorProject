"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TournamentCard } from "@/components/admin/tournament-card"
import { Plus, Search } from "lucide-react"

const mockTournaments = [
  {
    id: 1,
    name: "Valorant Woman",
    game: "Valorant",
    partner: "ESL",
    participants: 10000,
    teams: 32,
    format: "Teams",
    prizePool: 500000,
    published: true,
    status: "Upcoming",
  },
  {
    id: 2,
    name: "Overwatch 2",
    game: "Overwatch 2",
    partner: "Blizzard",
    participants: 10000,
    teams: 8,
    format: "Teams",
    prizePool: 1000000,
    published: true,
    status: "Upcoming",
  },
  {
    id: 3,
    name: "Rainbow Six Siege",
    game: "Rainbow Six Siege",
    partner: "Ubisoft",
    participants: 10000,
    teams: 16,
    format: "Teams",
    prizePool: 250000,
    published: false,
    status: "Upcoming",
  },
]

export default function TournamentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("All")

  const filtered = mockTournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "All" || t.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">Tournaments</h2>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus size={20} />
            Add Tournament
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search tournament name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border text-foreground"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 rounded-md bg-card border border-border text-foreground cursor-pointer"
          >
            <option>All</option>
            <option>Active</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tournament) => (
          <TournamentCard key={tournament.id} tournament={tournament} />
        ))}
      </div>
    </div>
  )
}
