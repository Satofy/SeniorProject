import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { users, setUserRole, deleteUser } from "../_mockData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  return NextResponse.json(users);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "id required" }, { status: 400 });
  const ok = deleteUser(id);
  if (!ok) return NextResponse.json({ message: "not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}

// Fallback for role change if not using nested route
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{}> }
) {
  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;
  const role = body?.role as string | undefined;
  if (!id || !role)
    return NextResponse.json(
      { message: "id and role required" },
      { status: 400 }
    );
  const ok = setUserRole(id, role as any);
  if (!ok) return NextResponse.json({ message: "not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
