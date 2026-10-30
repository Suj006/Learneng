import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one, query } from "./db";
import { randomToken, sha256 } from "./crypto";

export type SubjectType = "parent" | "child" | "admin";
const COOKIE = "pv_session";
const TTL_DAYS: Record<SubjectType, number> = { parent: 14, child: 30, admin: 1 };

export async function createSession(type: SubjectType, id: string) {
  const token = randomToken();
  const expires = new Date(Date.now() + TTL_DAYS[type] * 86400_000);
  await query(`insert into auth_sessions (token_hash, subject_type, subject_id, expires_at) values ($1,$2,$3,$4)`, [
    sha256(token), type, id, expires,
  ]);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await query(`delete from auth_sessions where token_hash = $1`, [sha256(token)]);
  jar.delete(COOKIE);
}

export async function getSession(): Promise<{ type: SubjectType; id: string } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const row = await one<{ subject_type: SubjectType; subject_id: string }>(
    `select subject_type, subject_id from auth_sessions where token_hash = $1 and expires_at > now()`,
    [sha256(token)],
  );
  return row ? { type: row.subject_type, id: row.subject_id } : null;
}

export interface ChildCtx {
  id: string; parent_id: string; display_name: string; username: string; grade: string;
  birth_month: number; birth_year: number;
}
export interface ParentCtx { id: string; email: string; email_verified_at: string | null; companion_enabled: boolean }

export async function currentChild(): Promise<ChildCtx | null> {
  const s = await getSession();
  if (!s || s.type !== "child") return null;
  return one<ChildCtx>(
    `select id, parent_id, display_name, username, grade, birth_month, birth_year from children where id = $1 and status = 'active'`,
    [s.id],
  );
}
export async function currentParent(): Promise<ParentCtx | null> {
  const s = await getSession();
  if (!s || s.type !== "parent") return null;
  return one<ParentCtx>(`select id, email, email_verified_at, companion_enabled from parents where id = $1`, [s.id]);
}
export async function currentAdmin() {
  const s = await getSession();
  if (!s || s.type !== "admin") return null;
  return one<{ id: string; email: string; name: string }>(`select id, email, name from admin_users where id = $1`, [s.id]);
}

/** Page guards (redirect). */
export async function requireChild() {
  const c = await currentChild();
  if (!c) redirect("/login");
  return c;
}
export async function requireParent() {
  const p = await currentParent();
  if (!p) redirect("/login?as=parent");
  return p;
}
export async function requireAdmin() {
  const a = await currentAdmin();
  if (!a) redirect("/admin/login");
  return a;
}
