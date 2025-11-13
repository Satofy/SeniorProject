import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resetMatch } from "@/app/api/_mockData";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string; matchId: string }> }
) {
  const { id, matchId } = await context.params;
  try {
    const match = resetMatch(id, matchId);
    return NextResponse.json(match);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Failed to reset match" },
      { status: 400 }
    );
  }
}
