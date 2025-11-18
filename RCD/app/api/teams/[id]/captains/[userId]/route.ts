import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTeam, setCaptain, users } from "@/app/api/_mockData";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await context.params;
  const team = getTeam(id);
  if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || token !== team.managerId) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  try {
    const updated = setCaptain(id, userId, true);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to add captain" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await context.params;
  const team = getTeam(id);
  if (!team) return NextResponse.json({ message: "Team not found" }, { status: 404 });
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || token !== team.managerId) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  try {
    const updated = setCaptain(id, userId, false);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to remove captain" }, { status: 400 });
  }
}
