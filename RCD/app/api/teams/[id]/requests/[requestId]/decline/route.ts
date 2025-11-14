import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { declineTeamJoinRequest } from "@/app/api/_mockData";

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string; requestId: string }> }) {
  const { id, requestId } = await context.params;
  try {
    const r = declineTeamJoinRequest(id, requestId);
    return NextResponse.json(r);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to decline" }, { status: 400 });
  }
}
