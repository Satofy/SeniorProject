import { NextResponse } from "next/server"
import { getTeam } from "../../_mockData"

export async function GET(_req: Request, context: { params: { id: string } }) {
  const team = getTeam(context.params.id)
  if (!team) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(team)
}
