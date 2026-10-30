import { NextResponse, type NextRequest } from "next/server";
import { one } from "@/server/db";
import { sha256 } from "@/server/crypto";
import { createSession } from "@/server/session";

/** Reached from the explicit "Verify" button (e-mail scanners only prefetch the /verify page). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const t = await one<{ parent_id: string }>(
    `update auth_tokens set used_at = now() where token_hash = $1 and purpose = 'verify_email' and used_at is null and expires_at > now() returning parent_id`, [sha256(token)]);
  if (!t) return NextResponse.redirect(new URL("/verify?expired=1", req.url), 303);
  await one(`update parents set email_verified_at = coalesce(email_verified_at, now()) where id = $1`, [t.parent_id]);
  await createSession("parent", t.parent_id);
  return NextResponse.redirect(new URL("/parent/consent", req.url), 303);
}
