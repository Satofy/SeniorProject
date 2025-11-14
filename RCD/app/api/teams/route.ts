import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { addTeam, teams, deleteTeam as removeTeam, users } from "../_mockData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  return NextResponse.json(teams);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  const body = await req.json().catch(() => ({}));
  const name = body?.name as string | undefined;
  const tag = body?.tag as string | undefined;
  if (!name)
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const managerId =
    token && users.find((u) => u.id === token) ? token : users[0].id;
  const t = addTeam(name, tag, managerId);
  return NextResponse.json(t, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "id required" }, { status: 400 });
  const ok = removeTeam(id);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
