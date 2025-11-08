"use client"

import { DashboardStats } from "@/components/admin/dashboard-stats"
import { TournamentOverview } from "@/components/admin/tournament-overview"
import { RecentActivity } from "@/components/admin/recent-activity"

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TournamentOverview />
        </div>
        <RecentActivity />
      </div>
    </div>
  )
}
