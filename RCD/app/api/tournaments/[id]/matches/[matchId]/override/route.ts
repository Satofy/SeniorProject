import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { overrideMatchWinner } from "@/app/api/_mockData";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await context.params;
  try {
    const body = await req.json().catch(() => ({}));
    const winnerId = body.winnerId as string | undefined;
    const score1 = body.score1 as number | undefined;
    const score2 = body.score2 as number | undefined;
    const actorId = body.actorId as string | undefined;
    if (!winnerId) {
      return NextResponse.json(
        { message: "winnerId is required" },
        { status: 400 }
      );
    }
    const match = overrideMatchWinner(
      id,
      matchId,
      winnerId,
      score1,
      score2,
      actorId || "admin"
    );
    return NextResponse.json(match);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to override match winner" },
      { status: 400 }
    );
  }
}
