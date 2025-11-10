import React from 'react'

type Match = {
  id: number
  tournament: string
  team1: string
  team2: string
  score1: number
  score2: number
  date: string
  time: string
  status: 'upcoming' | 'live' | 'completed'
  stage: string
}

export function MatchCard({ match, onStartMatch, onViewDetails }: { match: Match; onStartMatch?: (id: number) => void; onViewDetails?: (id: number) => void }) {
  // Minimal stub rendering; accepts props to satisfy type-checking across projects
  return (
    <div className="p-4 border rounded">
      <div className="font-medium">{match.tournament} • {match.stage}</div>
      <div className="text-sm text-muted-foreground">{match.team1} vs {match.team2}</div>
      <div className="mt-2 flex gap-2">
        {match.status === 'upcoming' && (
          <button onClick={() => onStartMatch?.(match.id)} className="px-2 py-1 border rounded">Start</button>
        )}
        <button onClick={() => onViewDetails?.(match.id)} className="px-2 py-1 border rounded">Details</button>
      </div>
    </div>
  )
}
