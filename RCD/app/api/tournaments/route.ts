import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  addTournament,
  tournaments as mockTournaments,
  registerForTournament,
} from "../_mockData";

type PandaTournament = {
  id: number;
  name: string;
  begin_at: string | null;
  end_at: string | null;
  status?: string;
};

function mapStatus(s?: string): "upcoming" | "ongoing" | "completed" {
  switch ((s || "").toLowerCase()) {
    case "running":
    case "in_progress":
      return "ongoing";
    case "finished":
    case "completed":
      return "completed";
    default:
      return "upcoming";
  }
}

// Switch to in-memory mock tournaments to support admin CRUD while keeping shape consistent
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  return NextResponse.json(mockTournaments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  const body = await req.json().catch(() => ({}));
  if (!body?.title || !body?.date) {
    return NextResponse.json(
      { message: "title and date are required" },
      { status: 400 }
    );
  }
  const t = addTournament(body);
  return NextResponse.json(t, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  // Optional bulk/utility action: register endpoint passthrough
  const body = await req.json().catch(() => ({}));
  if (body?.register && body?.id) {
    const ok = registerForTournament(String(body.id));
    if (!ok)
      return NextResponse.json(
        { message: "Not found or full" },
        { status: 400 }
      );
    return NextResponse.json({ success: true });
  }
  return NextResponse.json(
    { message: "Unsupported operation" },
    { status: 400 }
  );
}
