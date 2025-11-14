import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { reportMatch } from "@/app/api/_mockData";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await context.params;
  try {
    const body = await req.json().catch(() => ({}));
    const score1 = body.score1 as number | undefined;
    const score2 = body.score2 as number | undefined;
  const winnerOverride = body.winnerId as string | undefined;
  const actorId = body.actorId as string | undefined;
  const match = reportMatch(
    id,
    matchId,
    score1,
    score2,
    winnerOverride,
    actorId || "system"
  );
    return NextResponse.json(match);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to report match" },
      { status: 400 }
    );
  }
}
