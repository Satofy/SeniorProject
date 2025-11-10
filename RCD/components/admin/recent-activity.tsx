import React from 'react'

export function RecentActivity() {
  return (
    <section className="text-sm p-4 rounded border">
      <h2 className="font-semibold mb-2">Recent Activity</h2>
      <ul className="list-disc pl-5 text-muted-foreground">
        <li>No recent events.</li>
      </ul>
    </section>
  )
}
