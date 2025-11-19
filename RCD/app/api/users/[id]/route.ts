import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  users,
  setUserRole,
  deleteUser,
  updateUserProfile,
} from "../../_mockData";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = users.find((u) => u.id === id);
  if (!user)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));
  if (body?.role) {
    const ok = setUserRole(id, body.role);
    if (!ok)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    const user = users.find((u) => u.id === id);
    return NextResponse.json(user);
  }
  const { username, email, avatarUrl, social, gameIds, timezone, country, region } = body || {};
  if (
    typeof username === "undefined" &&
    typeof email === "undefined" &&
    typeof avatarUrl === "undefined" &&
    typeof social === "undefined" &&
    typeof gameIds === "undefined" &&
    typeof timezone === "undefined" &&
    typeof country === "undefined" &&
    typeof region === "undefined"
  ) {
    return NextResponse.json(
      { message: "No fields to update" },
      { status: 400 }
    );
  }
  const updated = updateUserProfile(id, { username, email, avatarUrl, social, gameIds, timezone, country, region });
  if (!updated)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ok = deleteUser(id);
  if (!ok) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
