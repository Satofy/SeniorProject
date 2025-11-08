import { NextRequest, NextResponse } from "next/server"
import { users } from "../../_mockData"

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  if (!token) return NextResponse.json({ message: "unauthorized" }, { status: 401 })
  const user = users.find((u) => u.id === token)
  if (!user) return NextResponse.json({ message: "unauthorized" }, { status: 401 })
  return NextResponse.json(user)
}
