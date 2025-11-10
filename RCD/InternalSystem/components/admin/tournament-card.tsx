"use client"
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit2, Settings } from "lucide-react"

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

export interface TournamentCardProps {
  tournament: AdminTournamentCardData;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  return (
    <Card className="border-border bg-card hover:bg-card/80 transition-colors cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1">
              {tournament.name}
            </h3>
            <p className="text-sm text-muted-foreground">{tournament.game}</p>
          </div>
          <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-primary">G</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Game</p>
            <p className="font-semibold text-foreground">{tournament.game}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Partner</p>
            <p className="font-semibold text-foreground">
              {tournament.partner}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="font-semibold text-foreground">
              0/{tournament.participants}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teams</p>
            <p className="font-semibold text-foreground">{tournament.teams}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Format</p>
            <p className="font-semibold text-foreground">{tournament.format}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prize Pool</p>
            <p className="font-semibold text-foreground">
              ${(tournament.prizePool / 1000).toFixed(0)}K
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-2">
            <Badge variant={tournament.published ? "default" : "secondary"}>
              {tournament.published ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <Edit2 size={18} />
            </button>
            <button className="p-2 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
