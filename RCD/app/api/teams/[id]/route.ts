import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { getTeam } from "../../_mockData"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const team = getTeam(params.id);
  if (!team)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}
