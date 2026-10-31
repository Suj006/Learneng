import { NextResponse, type NextRequest } from "next/server";
import { aiEnabled } from "@/server/ai/client";
import { coverage, runGeneration } from "@/server/content/pipeline";
import { one } from "@/server/db";
import { cronAuthorized, unauthorized } from "@/server/cron";

export const maxDuration = 300;

/**
 * Daily. Keeps the review queue topped up for bands whose fresh-vocabulary runway is
 * below 60 days. Output only enters the admin REVIEW QUEUE — never children directly.
 */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return unauthorized();
  if (!aiEnabled()) return NextResponse.json({ skipped: "no AI key (ANTHROPIC_API_KEY / PINGVIBE_ANTHROPIC_API_KEY)" });
  const pending = (await one<{ n: number }>(`select count(*)::int n from content_library where status = 'pending'`))!.n;
  if (pending > 200) return NextResponse.json({ skipped: "review queue already large", pending });
  const low = Array.from(new Set((await coverage()).filter((c) => c.vocabDays < 60).map((c) => c.band)));
  const out: Record<number, unknown> = {};
  for (const band of low) {
    try { out[band] = await runGeneration("vocabulary", band, { count: 10, requestedBy: "cron" }); } catch (e) { out[band] = (e as Error).message; }
  }
  return NextResponse.json({ topped: out });
}
