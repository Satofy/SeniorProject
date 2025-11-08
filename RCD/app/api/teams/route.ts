import { NextRequest, NextResponse } from "next/server"
import { addTeam, teams, deleteTeam as removeTeam } from "../_mockData"

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

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ message: "id required" }, { status: 400 })
  const ok = removeTeam(id)
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
