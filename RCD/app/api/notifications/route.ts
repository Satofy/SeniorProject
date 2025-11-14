import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { users, listUserNotifications, clearUserNotifications } from "../_mockData"

function extractToken(req: NextRequest): string | null {
  const auth =
    req.headers.get("authorization") || req.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  return null;
}

export async function GET(req: NextRequest) {
  const trace: Record<string, any> = { stage: "init" };
  try {
    const token = extractToken(req);
    if (!token) {
      trace.stage = "missing_token";
      return NextResponse.json(
        { message: "unauthorized", trace },
        { status: 401 }
      );
    }
    trace.token = token;
    const user = users.find((u) => u.id === token);
    if (!user) {
      trace.stage = "user_not_found";
      return NextResponse.json(
        { message: "unauthorized", trace },
        { status: 401 }
      );
    }
    trace.stage = "user_found";
    const notes = listUserNotifications(user.id) || [];
    trace.count = notes.length;
    return NextResponse.json(notes);
  } catch (e: any) {
    trace.stage = "exception";
    trace.error = e?.message;
    console.error("/api/notifications GET error", trace, e);
    return NextResponse.json(
      { message: e?.message || "internal error", trace },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const trace: Record<string, any> = { stage: "init" };
  try {
    const token = extractToken(req);
    if (!token) {
      trace.stage = "missing_token";
      return NextResponse.json(
        { message: "unauthorized", trace },
        { status: 401 }
      );
    }
    trace.token = token;
    const user = users.find((u) => u.id === token);
    if (!user) {
      trace.stage = "user_not_found";
      return NextResponse.json(
        { message: "unauthorized", trace },
        { status: 401 }
      );
    }
    clearUserNotifications(user.id);
    trace.stage = "cleared";
    return NextResponse.json({ success: true, trace });
  } catch (e: any) {
    trace.stage = "exception";
    trace.error = e?.message;
    console.error("/api/notifications DELETE error", trace, e);
    return NextResponse.json(
      { message: e?.message || "internal error", trace },
      { status: 500 }
    );
  }
}
