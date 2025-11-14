import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { users, markAllNotificationsRead } from "@/app/api/_mockData"

function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization") || ""
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim() || null
  return null
}

export async function POST(req: NextRequest) {
  const trace: Record<string, any> = { stage: "init" }
  try {
    const token = extractToken(req)
    if (!token) return NextResponse.json({ message: "unauthorized", trace: { ...trace, stage: "missing_token" } }, { status: 401 })
    const user = users.find(u => u.id === token)
    if (!user) return NextResponse.json({ message: "unauthorized", trace: { ...trace, stage: "user_not_found" } }, { status: 401 })
    const cnt = markAllNotificationsRead(user.id)
    return NextResponse.json({ success: true, updated: cnt })
  } catch (e: any) {
    trace.stage = "exception"
    trace.error = e?.message
    console.error("/api/notifications/read error", trace, e)
    return NextResponse.json({ message: e?.message || 'internal error', trace }, { status: 500 })
  }
}
