import { NextRequest, NextResponse } from "next/server";
import { discover } from "@/server/home";
import { ipRateLimit } from "@/server/ratelimit";

/** Public homepage preview: Word of the Day, discovery puzzle and Story of the Day for an age band. No personal data. */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!(await ipRateLimit(`discover:${ip}`, 120, 3600))) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const band = Number(req.nextUrl.searchParams.get("band") ?? 2);
  return NextResponse.json(await discover(band), { headers: { "Cache-Control": "public, max-age=300" } });
}
