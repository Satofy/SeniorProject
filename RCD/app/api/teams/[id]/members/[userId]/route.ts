import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { removeMember } from "../../../../_mockData"

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await context.params;
  const ok = removeMember(id, userId);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
