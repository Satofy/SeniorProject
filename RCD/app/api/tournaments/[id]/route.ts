import { NextResponse } from "next/server"
import { getTournament, updateTournament, removeTournament } from "../../_mockData"

export async function GET(_req: Request, context: { params: { id: string } }) {
  const t = getTournament(context.params.id)
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(t)
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const t = updateTournament(context.params.id, body)
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(t)
}

export async function DELETE(_req: Request, context: { params: { id: string } }) {
  const ok = removeTournament(context.params.id)
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
