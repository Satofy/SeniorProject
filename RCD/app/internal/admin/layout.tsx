"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "../../../InternalSystem/components/admin/sidebar"
import { AdminHeader } from "../../../InternalSystem/components/admin/header"

export default function InternalAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
