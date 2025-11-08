"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InternalAccessPage() {
  return (
    <div className="p-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Access System</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Access control coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
