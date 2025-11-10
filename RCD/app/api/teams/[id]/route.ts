import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { getTeam } from "../../_mockData"

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
