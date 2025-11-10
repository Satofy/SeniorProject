import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { removeMember } from "../../../../_mockData"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  const ok = removeMember(params.id, params.userId);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
