"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const tournaments = [
  {
    id: 1,
    name: "Overwatch 2 World Cup",
    status: "Active",
    stages: 3,
    participants: 128,
  },
  {
    id: 2,
    name: "Valorant Champions",
    status: "Upcoming",
    stages: 4,
    participants: 64,
  },
  {
    id: 3,
    name: "CS2 Major",
    status: "Planning",
    stages: 3,
    participants: 32,
  },
]

export function TournamentOverview() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Active Tournaments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{tournament.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {tournament.stages} stages • {tournament.participants} participants
                </p>
              </div>
              <Badge
                variant={
                  tournament.status === "Active"
                    ? "default"
                    : tournament.status === "Upcoming"
                      ? "secondary"
                      : "outline"
                }
              >
                {tournament.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
