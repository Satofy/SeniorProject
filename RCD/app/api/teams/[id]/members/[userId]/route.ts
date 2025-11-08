import { NextResponse } from "next/server"
import { removeMember } from "../../../../_mockData"

export async function DELETE(_req: Request, context: { params: { id: string; userId: string } }) {
  const ok = removeMember(context.params.id, context.params.userId)
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
