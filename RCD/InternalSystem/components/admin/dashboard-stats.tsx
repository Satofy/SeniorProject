"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Zap, BarChart3 } from "lucide-react"

const stats = [
  {
    label: "Total Tournaments",
    value: "12",
    icon: Trophy,
    color: "text-blue-400",
  },
  {
    label: "Active Matches",
    value: "48",
    icon: Zap,
    color: "text-amber-400",
  },
  {
    label: "Total Players",
    value: "324",
    icon: Users,
    color: "text-emerald-400",
  },
  {
    label: "Completion Rate",
    value: "87%",
    icon: BarChart3,
    color: "text-purple-400",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label} className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <Icon className={`${stat.color} opacity-40`} size={32} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
