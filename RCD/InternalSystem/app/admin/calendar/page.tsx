"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarPage() {
  return (
    <div className="p-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Tournament Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calendar view coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
