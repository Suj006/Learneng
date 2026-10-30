import "server-only";
import { NextResponse, type NextRequest } from "next/server";

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. */
export function cronAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
}
export const unauthorized = () => NextResponse.json({ error: "unauthorized" }, { status: 401 });
