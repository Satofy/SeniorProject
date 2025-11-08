import { NextRequest, NextResponse } from "next/server"
import { users } from "../../_mockData"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = body?.email as string | undefined
  const password = body?.password as string | undefined
  if (!email || !password) return NextResponse.json({ message: "email and password required" }, { status: 400 })
  const user = users.find((u) => u.email === email)
  if (!user) return NextResponse.json({ message: "invalid credentials" }, { status: 401 })
  // For mock, any password accepted
  return NextResponse.json({ token: user.id, user })
}
