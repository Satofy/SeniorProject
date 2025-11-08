import { NextRequest, NextResponse } from "next/server"
import { users, setUserRole, deleteUser } from "../../_mockData"

export async function GET(_req: NextRequest, context: { params: { id: string } }) {
  const user = users.find((u) => u.id === context.params.id)
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  if (body?.role) {
    const ok = setUserRole(context.params.id, body.role)
    if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ message: "No fields to update" }, { status: 400 })
}

export async function DELETE(_req: NextRequest, context: { params: { id: string } }) {
  const ok = deleteUser(context.params.id)
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
