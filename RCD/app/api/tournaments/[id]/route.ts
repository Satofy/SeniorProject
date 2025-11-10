import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getTournament,
  updateTournament,
  removeTournament,
} from "../../_mockData";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const t = getTournament(id);
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const body = await req.json().catch(() => ({}));
  const { id } = await context.params;
  const t = updateTournament(id, body);
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const body = await req.json().catch(() => ({}));
  const { id } = await context.params;
  const t = updateTournament(id, body);
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ok = removeTournament(id);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
