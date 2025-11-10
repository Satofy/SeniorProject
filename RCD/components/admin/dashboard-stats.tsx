import React from 'react'

// Lightweight stub to satisfy imports; replace with richer implementation or re-export real InternalSystem component.
export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="p-4 rounded border">Tournaments: <span className="font-semibold">0</span></div>
      <div className="p-4 rounded border">Matches: <span className="font-semibold">0</span></div>
      <div className="p-4 rounded border">Players: <span className="font-semibold">0</span></div>
      <div className="p-4 rounded border">Completion: <span className="font-semibold">0%</span></div>
    </div>
  )
}
