import { NextRequest, NextResponse } from "next/server"
import { setUserRole } from "../../../_mockData"

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const role = body?.role as string | undefined
  if (!role) return NextResponse.json({ message: "role required" }, { status: 400 })
  const ok = setUserRole(context.params.id, role as any)
  if (!ok) return NextResponse.json({ message: "not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
