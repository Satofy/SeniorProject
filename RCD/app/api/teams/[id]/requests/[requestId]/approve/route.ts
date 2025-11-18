import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { approveTeamJoinRequest, getTeam } from "@/app/api/_mockData";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; requestId: string }> }) {
  const { id, requestId } = await context.params;
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    const team = getTeam(id);
    if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });
    if (!token || token !== team.managerId) {
      return NextResponse.json({ message: "forbidden" }, { status: 403 });
    }
    const r = approveTeamJoinRequest(id, requestId);
    return NextResponse.json(r);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to approve" }, { status: 400 });
  }
}
