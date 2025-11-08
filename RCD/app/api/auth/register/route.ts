import { NextRequest, NextResponse } from "next/server"
import { addUser } from "../../_mockData"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = body?.email as string | undefined
  const password = body?.password as string | undefined // ignored for mock
  const username = body?.username as string | undefined
  if (!email || !password) return NextResponse.json({ message: "email and password required" }, { status: 400 })
  const user = addUser(email, password, username)
  // Return mock token (user id) and user object
  return NextResponse.json({ token: user.id, user })
}
