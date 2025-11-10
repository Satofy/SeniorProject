import React from 'react'
import Link from 'next/link'

const links = [
  { href: '/internal/admin/dashboard', label: 'Dashboard' },
  { href: '/internal/admin/tournaments', label: 'Tournaments' },
  { href: '/internal/admin/matches', label: 'Matches' },
  { href: '/internal/admin/users', label: 'Users' }
]

export function AdminSidebar() {
  return (
    <aside className="w-56 p-4 space-y-2 border rounded">
      <h1 className="font-bold text-lg mb-2">Admin</h1>
      <nav className="flex flex-col gap-1">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="text-sm hover:underline">
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
