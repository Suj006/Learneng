import { NextResponse, type NextRequest } from "next/server";

/** Exposes the pathname to server layouts (used for the assessment gate). */
export function middleware(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}
export const config = { matcher: ["/world/:path*"] };
