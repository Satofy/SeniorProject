import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getTournament,
  updateTournament,
  removeTournament,
} from "../../_mockData";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const t = getTournament(params.id);
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const t = updateTournament(params.id, body);
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => ({}));
  const t = updateTournament(params.id, body);
  if (!t) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ok = removeTournament(params.id);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
