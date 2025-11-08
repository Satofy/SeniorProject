"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Grid3x3, Calendar, Shield, Users, Trophy, Gamepad2, LogOut } from "lucide-react"
import { cn } from "../../../lib/utils"
import { useAuth } from "../../../lib/auth-context"

const base = "/internal/admin"
const navItems = [
  { label: "Dashboards", href: `${base}/dashboard`, icon: Grid3x3 },
  { label: "Tournaments", href: `${base}/tournaments`, icon: Trophy },
  { label: "Matches", href: `${base}/matches`, icon: Gamepad2 },
  { label: "Calendar", href: `${base}/calendar`, icon: Calendar },
  { label: "Access System", href: `${base}/access`, icon: Shield },
  { label: "Users", href: `${base}/users`, icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href={`${base}/dashboard`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">E</span>
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">Esports</h1>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
