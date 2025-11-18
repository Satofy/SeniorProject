import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { getTeam, removeMember, users } from "../../../../_mockData"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await context.params;
  // Manager-only action
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const team = getTeam(id);
  if (!team) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (!token || token !== team.managerId) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const ok = removeMember(id, userId);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
