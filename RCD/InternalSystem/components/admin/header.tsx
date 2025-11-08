"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, User } from "lucide-react"

export function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user] = useState({ name: "Admin User", role: "Super Admin" })

  const getPageTitle = () => {
    const segments = pathname.split("/")
    if (segments.includes("dashboard")) return "Dashboard"
    if (segments.includes("tournaments")) return "Tournaments"
    if (segments.includes("calendar")) return "Calendar"
    if (segments.includes("access")) return "Access System"
    if (segments.includes("users")) return "Users"
    return "Admin"
  }

  const showBack = pathname !== "/internal/admin/dashboard"

  return (
    <header className="bg-primary h-20 border-b border-border flex items-center px-8 justify-between">
      <div className="flex items-center gap-4">
        {showBack && (
          <button onClick={() => router.back()} className="text-primary-foreground hover:opacity-80 transition-opacity">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-2xl font-bold text-primary-foreground">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right text-primary-foreground">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs opacity-90">{user.role}</p>
        </div>
        <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
          <User size={20} className="text-primary-foreground" />
        </div>
      </div>
    </header>
  )
}
