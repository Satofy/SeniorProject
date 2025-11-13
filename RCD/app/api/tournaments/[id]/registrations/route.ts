import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { listRegistrations, getTournament } from "../../../_mockData"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const t = getTournament(id)
  if (!t) return NextResponse.json({ message: "Tournament not found" }, { status: 404 })
  const regs = listRegistrations(id)
  return NextResponse.json(regs)
}
