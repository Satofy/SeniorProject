"use client"

import { clsx } from "clsx"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Sword, Trophy, Car, Target, FlameKindling, Joystick, Users } from "lucide-react"

// Icon mapping for games
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  valorant: Target,
  "rocket league": Car,
  "ea fc25": Trophy,
  "efootball": Trophy,
  "tekken 8": Sword,
  "street fighter 6": FlameKindling,
  cs2: Target,
  "dota 2": Joystick,
}

export function gameKey(name?: string): string | undefined {
  if (!name) return undefined
  const lower = name.toLowerCase().trim()
  // attempt direct match
  if (ICON_MAP[lower]) return lower
  // fuzzy matches
  if (lower.includes("valor")) return "valorant"
  if (lower.includes("rocket")) return "rocket league"
  if (lower.includes("fc")) return "ea fc25"
  if (lower.includes("efootball")) return "efootball"
  if (lower.includes("tekken")) return "tekken 8"
  if (lower.includes("street") || lower.includes("fighter")) return "street fighter 6"
  if (lower.includes("counter") || lower.includes("cs2")) return "cs2"
  if (lower.includes("dota")) return "dota 2"
  return undefined
}

export function GameBadge({ game, className }: { game?: string; className?: string }) {
  if (!game) return null
  const key = gameKey(game) || game.toLowerCase()
  const Icon = ICON_MAP[key] || Gamepad2
  return (
    <Badge variant="outline" className={clsx("flex items-center gap-1 px-2 py-0.5", className)}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium capitalize line-clamp-1">{game}</span>
    </Badge>
  )
}
