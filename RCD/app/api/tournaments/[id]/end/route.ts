import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { endTournamentAndPayout, getTournament } from "@/app/api/_mockData";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const payout = endTournamentAndPayout(id);
    return NextResponse.json(payout);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to end tournament" },
      { status: 400 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Read-only view of payout if already done
  const { id } = await context.params;
  const t = getTournament(id);
  if (!t) return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
  if (!t.payout) return NextResponse.json({ message: "Payout not completed" }, { status: 404 });
  return NextResponse.json(t.payout);
}
