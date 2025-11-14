import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { listManagerPendingRequests, users } from "@/app/api/_mockData";

export async function GET(req: NextRequest, _context: { params: Promise<{}> }) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !users.find(u => u.id === token)) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }
  const data = listManagerPendingRequests(token)
  return NextResponse.json(data)
}
