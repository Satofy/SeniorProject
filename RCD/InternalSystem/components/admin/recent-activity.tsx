"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const activities = [
  {
    id: 1,
    action: "New tournament created",
    details: "Tekken 8 Championship",
    time: "2 hours ago",
    type: "create",
  },
  {
    id: 2,
    action: "Stage completed",
    details: "Overwatch 2 - Qualifiers",
    time: "5 hours ago",
    type: "complete",
  },
  {
    id: 3,
    action: "Match updated",
    details: "Valorant Major - Round 2",
    time: "1 day ago",
    type: "update",
  },
  {
    id: 4,
    action: "Admin added",
    details: "user@esports.local",
    time: "3 days ago",
    type: "admin",
  },
]

export function RecentActivity() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="text-sm border-b border-border pb-3 last:border-0">
              <div className="flex items-start justify-between mb-1">
                <p className="font-medium text-foreground">{activity.action}</p>
                <Badge variant="outline" className="text-xs">
                  {activity.time}
                </Badge>
              </div>
              <p className="text-muted-foreground">{activity.details}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
