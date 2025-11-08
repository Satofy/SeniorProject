import { NextRequest, NextResponse } from "next/server";
import { getTournamentsByGame, type GameSlug } from "@/lib/pandascore";

export const dynamic = "force-dynamic"; // ensure always server-rendered

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = (searchParams.get("game") || "valorant") as GameSlug;
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("perPage") || 25);

    const data = await getTournamentsByGame({ game, page, perPage });

    return NextResponse.json({
      ok: true,
      meta: { game, page, perPage, count: data.length },
      data,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
