import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { editMatchScore } from "@/app/api/_mockData";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await context.params;
  try {
    const body = await req.json().catch(() => ({}));
    const score1 = body.score1 as number | undefined;
    const score2 = body.score2 as number | undefined;
    const actorId = body.actorId as string | undefined;
    if (typeof score1 !== "number" || typeof score2 !== "number") {
      return NextResponse.json(
        { message: "score1 and score2 are required numbers" },
        { status: 400 }
      );
    }
    const match = editMatchScore(id, matchId, score1, score2, actorId || "system");
    return NextResponse.json(match);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to edit match score" },
      { status: 400 }
    );
  }
}
