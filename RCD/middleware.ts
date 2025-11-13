import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Permissive CORS for senior project/dev use:
// - Always allow any origin ("*")
// - Do NOT set credentials, so wildcard is valid
function applyCorsHeaders(req: NextRequest, res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  const requested = req.headers.get("access-control-request-headers");
  res.headers.set(
    "Access-Control-Allow-Headers",
    requested || "Content-Type, Authorization, X-Requested-With"
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (!isApi) return NextResponse.next();

  if (req.method === "OPTIONS") {
    const res = new NextResponse(null, { status: 204 });
    applyCorsHeaders(req, res);
    return res;
  }

  const res = NextResponse.next();
  applyCorsHeaders(req, res);
  return res;
}

// Only run for API routes
export const config = {
  matcher: ["/api/:path*"],
};
