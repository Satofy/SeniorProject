"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Play, Pause, CheckCircle } from "lucide-react"

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  // Mock match data - in production, fetch based on params.id
  const match = {
    id: Number.parseInt(params.id),
    tournament: "Valorant Woman",
    stage: "Group Stage",
    team1: "Phoenix Rising",
    team2: "Diamond Squad",
    score1: 2,
    score2: 1,
    date: "Nov 15, 2024",
    time: "19:00",
    status: "completed" as const,
    team1Roster: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5"],
    team2Roster: ["Player A", "Player B", "Player C", "Player D", "Player E"],
    rounds: [
      { round: 1, team1: 13, team2: 11 },
      { round: 2, team1: 13, team2: 9 },
      { round: 3, team1: 13, team2: 8 },
    ],
  }

  const statusConfig = {
    upcoming: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Upcoming" },
    live: { bg: "bg-red-500/20", text: "text-red-400", label: "Live" },
    completed: { bg: "bg-green-500/20", text: "text-green-400", label: "Completed" },
  }

  const config = statusConfig[match.status]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={20} />
        Back to Matches
      </button>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {match.tournament}
            </h1>
            <p className="text-muted-foreground">
              {match.stage} • {match.date} at {match.time}
            </p>
          </div>
          <Badge className={`${config.bg} ${config.text} border-0`}>
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Match Score */}
      <Card className="mb-8 border-border bg-card">
        <CardHeader>
          <CardTitle className="text-center">Match Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-8">
            <div className="flex-1 text-center">
              <p className="text-muted-foreground text-sm mb-3">Team 1</p>
              <p className="text-5xl font-bold text-primary mb-3">
                {match.team1}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {match.score1}
              </p>
            </div>
            <div className="px-8 text-center">
              <p className="text-4xl font-bold text-primary">VS</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-muted-foreground text-sm mb-3">Team 2</p>
              <p className="text-5xl font-bold text-primary mb-3">
                {match.team2}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {match.score2}
              </p>
            </div>
          </div>

          {String(match.status) === "upcoming" && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Play size={18} />
                Start Match
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-border text-foreground hover:bg-card bg-transparent"
              >
                Cancel Match
              </Button>
            </div>
          )}

          {String(match.status) === "live" && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-border">
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-primary-foreground gap-2">
                <Pause size={18} />
                Pause Match
              </Button>
              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-primary-foreground gap-2">
                <CheckCircle size={18} />
                End Match
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rounds */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {match.rounds.map((round) => (
                <div
                  key={round.round}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <p className="text-sm font-medium text-foreground">
                    Round {round.round}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {match.team1}
                    </span>
                    <span className="font-bold text-primary">
                      {round.team1}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className="font-bold text-primary">
                      {round.team2}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {match.team2}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Rosters */}
        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{match.team1} Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {match.team1Roster.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-background rounded-lg text-foreground text-sm"
                  >
                    {player}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>{match.team2} Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {match.team2Roster.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-background rounded-lg text-foreground text-sm"
                  >
                    {player}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
