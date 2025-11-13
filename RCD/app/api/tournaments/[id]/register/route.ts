import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRegistration, getTournament } from "../../../_mockData"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await req.json().catch(() => ({})) as { teamId?: string }

  const t = getTournament(id)
  if (!t) return NextResponse.json({ message: "Tournament not found" }, { status: 404 })
  if (t.status !== "upcoming") {
    return NextResponse.json({ message: "Registration closed" }, { status: 400 })
  }

  // In a real app we would resolve user from auth token and validate role/team ownership
  try {
    const teamId = body?.teamId || "t1" // fallback for mock
    const reg = createRegistration(id, teamId)
    return NextResponse.json(reg, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Unable to register" }, { status: 400 })
  }
}
