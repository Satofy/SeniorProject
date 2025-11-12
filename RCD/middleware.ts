import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In dev, allow local apps to call the API cross-origin
const DEFAULT_ALLOWED = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

function getAllowedOrigins(): string[] {
  const env = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS;
  if (!env) return DEFAULT_ALLOWED;
  return env.split(",").map((s) => s.trim()).filter(Boolean);
}

function applyCorsHeaders(res: NextResponse, origin: string | null, allowed: string[]) {
  const o = origin || "";
  if (o && allowed.includes(o)) {
    res.headers.set("Access-Control-Allow-Origin", o);
    res.headers.set("Vary", "Origin");
  } else {
    // Wildcard only safe when not using credentials
    res.headers.set("Access-Control-Allow-Origin", "*");
  }
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  // Allow credentials so cookie-based auth can work when origin is explicitly allowed
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (!isApi) return NextResponse.next();

  const allowed = getAllowedOrigins();
  const origin = req.headers.get("origin");

  // Handle preflight
  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    applyCorsHeaders(res, origin, allowed);
    return res;
  }

  const res = NextResponse.next();
  applyCorsHeaders(res, origin, allowed);
  return res;
}

// Only run for API routes
export const config = {
  matcher: ["/api/:path*"],
};
