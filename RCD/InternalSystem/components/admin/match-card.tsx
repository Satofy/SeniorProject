"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle, Clock } from "lucide-react"

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

export function MatchCard({
  match,
  onStartMatch,
  onViewDetails,
}: {
  match: Match
  onStartMatch?: (id: number) => void
  onViewDetails?: (id: number) => void
}) {
  const statusConfig = {
    upcoming: { color: "bg-blue-500/20 text-blue-400", icon: Clock, label: "Upcoming" },
    live: { color: "bg-red-500/20 text-red-400", icon: Play, label: "Live" },
    completed: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Completed" },
  }

  const config = statusConfig[match.status]
  const StatusIcon = config.icon

  return (
    <Card className="border-border bg-card hover:bg-card/80 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">
              {match.tournament} • {match.stage}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {match.date} at {match.time}
            </p>
          </div>
          <Badge className={`${config.color} border-0 gap-1`}>
            <StatusIcon size={14} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-4 border-y border-border">
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground mb-1">Team 1</p>
            <p className="text-lg font-bold text-foreground">{match.team1}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-2xl font-bold text-primary">{match.score1}</p>
            <p className="text-xs text-muted-foreground">:</p>
            <p className="text-2xl font-bold text-primary">{match.score2}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-sm text-muted-foreground mb-1">Team 2</p>
            <p className="text-lg font-bold text-foreground">{match.team2}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {match.status === "upcoming" && (
            <Button
              onClick={() => onStartMatch?.(match.id)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Play size={16} />
              Start Match
            </Button>
          )}
          <Button
            onClick={() => onViewDetails?.(match.id)}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-card"
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
