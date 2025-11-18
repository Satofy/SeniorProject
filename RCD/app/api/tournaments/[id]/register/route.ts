import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRegistration, getTournament, getTeam } from "../../../_mockData"

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

  // Validate request ownership: require teamId and manager/captain authorization
  const teamId = body?.teamId
  if (!teamId) return NextResponse.json({ message: "teamId is required" }, { status: 400 })
  const team = getTeam(teamId)
  if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 })
  const auth = req.headers.get("authorization") || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null
  const isManager = token === team.managerId
  const isCaptain = !!(team.captainIds && token && team.captainIds.includes(token))
  if (!isManager && !isCaptain) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 })
  }

  try {
    const reg = createRegistration(id, teamId)
    return NextResponse.json(reg, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Unable to register" }, { status: 400 })
  }
}
