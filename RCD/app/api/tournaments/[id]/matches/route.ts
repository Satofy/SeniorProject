import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBracket } from "@/app/api/_mockData";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const bracket = getBracket(id);
  if (!bracket) return NextResponse.json([], { status: 200 });
  const all: any[] = [];
  for (const side of ["winners", "losers", "grand"] as const) {
    bracket.rounds[side].forEach((r) => {
      r.matches.forEach((m) => all.push(m));
    });
  }
  return NextResponse.json(all);
}
