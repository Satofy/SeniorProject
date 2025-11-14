import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createJoinRequest } from "@/app/api/_mockData";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  // Extract current user from Authorization header (mock: token is userId)
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const body = await req.json().catch(() => ({}));
  const userId = (body?.userId as string | undefined) || token || undefined;
  if (!userId) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  try {
    const jr = createJoinRequest(id, userId);
    return NextResponse.json(jr, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to request join" }, { status: 400 });
  }
}
