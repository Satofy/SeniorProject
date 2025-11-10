import React from 'react'

export interface AdminTournamentCardData {
  id: number;
  name: string;
  game: string;
  partner: string;
  participants: number;
  teams: number;
  format: string;
  prizePool: number;
  published: boolean;
  status: string;
}

export function TournamentCard({
  tournament,
}: {
  tournament: AdminTournamentCardData;
}) {
  return (
    <div className="p-4 border rounded">
      <div className="font-semibold">{tournament.name}</div>
      <div className="text-sm text-muted-foreground">
        {tournament.game} • {tournament.format}
      </div>
    </div>
  );
}
