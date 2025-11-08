import { NextResponse } from "next/server"
import { auditLogs } from "../../_mockData"

export async function GET() {
  // Newest first
  return NextResponse.json([...auditLogs].reverse())
}
