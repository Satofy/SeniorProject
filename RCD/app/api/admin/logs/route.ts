import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { auditLogs } from "../../_mockData"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  // Newest first
  return NextResponse.json([...auditLogs].reverse());
}
