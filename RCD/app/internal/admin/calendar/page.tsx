"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InternalCalendarPage() {
  return (
    <div className="p-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
