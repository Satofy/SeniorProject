import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  getTournament,
  listRegistrations,
  generateSingleElimBracket,
  generateDoubleElimBracket,
  getBracket,
  updateTournament,
} from "../../../_mockData"

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const t = getTournament(id)
  if (!t) return NextResponse.json({ message: "Tournament not found" }, { status: 404 })

  const body = await req.json().catch(() => ({})) as { format?: "single" | "double" }
  const format = body?.format || (t.type?.toLowerCase().includes("double") ? "double" : "single")

  const regs = listRegistrations(id).filter((r) => r.status === "approved")
  const teamIds = regs.map((r) => r.teamId)
  if (teamIds.length < 2) {
    return NextResponse.json({ message: "Not enough teams to start" }, { status: 400 })
  }

  // idempotent: if bracket exists, return it
  const existing = getBracket(id)
  if (existing) {
    return NextResponse.json(existing)
  }

  const bracket = format === "double"
    ? generateDoubleElimBracket(id, teamIds)
    : generateSingleElimBracket(id, teamIds)

  updateTournament(id, { status: "ongoing" })
  return NextResponse.json(bracket)
}
