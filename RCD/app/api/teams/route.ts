import { NextRequest, NextResponse } from "next/server"
import { addTeam, teams } from "../_mockData"

export async function GET() {
  return NextResponse.json(teams)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = body?.name as string | undefined
  const tag = body?.tag as string | undefined
  if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 })
  const t = addTeam(name, tag)
  return NextResponse.json(t, { status: 201 })
}
