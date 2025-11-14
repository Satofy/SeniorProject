import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { users, listUserNotifications, clearUserNotifications } from "../_mockData"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return NextResponse.json({ message: "unauthorized" }, { status: 401 })
  const user = users.find(u => u.id === token)
  if (!user) return NextResponse.json({ message: "unauthorized" }, { status: 401 })
  const notes = listUserNotifications(user.id)
  return NextResponse.json(notes)
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return NextResponse.json({ message: "unauthorized" }, { status: 401 })
  const user = users.find(u => u.id === token)
  if (!user) return NextResponse.json({ message: "unauthorized" }, { status: 401 })
  clearUserNotifications(user.id)
  return NextResponse.json({ success: true })
}
