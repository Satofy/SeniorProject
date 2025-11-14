import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listTeamJoinRequests, users } from "@/app/api/_mockData";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const list = listTeamJoinRequests(id).map(r => ({
    ...r,
    user: users.find(u => u.id === r.userId) || undefined,
  }));
  return NextResponse.json(list);
}
