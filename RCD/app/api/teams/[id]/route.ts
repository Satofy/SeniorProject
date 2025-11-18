import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { getTeam, teams } from "../../_mockData"

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const team = getTeam(id);
  if (!team)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const team = getTeam(id);
  if (!team)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const isCaptain = !!(team.captainIds && token && team.captainIds.includes(token));
  const isManager = token === team.managerId;
  if (!isManager && !isCaptain) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const { name, tag } = body || {};
  if (typeof name === "string" && name.trim()) team.name = name.trim();
  if (typeof tag === "string") team.tag = tag.trim();
  return NextResponse.json(team);
}
