import "server-only";
import { one, query, tx } from "./db";
import { hashPassword, randomToken, sha256 } from "./crypto";
import { emailLayout, sendEmail } from "./email";
import { bandForGrade } from "@/lib/grades";

const ADJ = ["star", "cosmic", "brave", "sunny", "magic", "rocket", "turbo", "pixel", "happy", "zippy", "lucky", "comet"];
const NOUN = ["lexi", "max", "panda", "tiger", "owl", "fox", "dragon", "dolphin", "falcon", "koala", "otter", "comet"];

/** Explorer usernames are random and never contain the child's real name (privacy). */
export async function generateUsername(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const u = `${ADJ[Math.floor(Math.random() * ADJ.length)]}${NOUN[Math.floor(Math.random() * NOUN.length)]}${Math.floor(100 + Math.random() * 900)}`;
    if (!(await one(`select 1 from children where username = $1`, [u]))) return u;
  }
  return `explorer${randomToken(4).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
}

export async function createPendingChild(parentId: string, c: { name: string; birthMonth: number; birthYear: number; grade: string }) {
  const username = await generateUsername();
  return tx(async (q) => {
    const child = (await q.query<{ id: string }>(
      `insert into children (parent_id, display_name, username, birth_month, birth_year, grade) values ($1,$2,$3,$4,$5,$6) returning id`,
      [parentId, c.name.trim(), username, c.birthMonth, c.birthYear, c.grade],
    )).rows[0];
    await q.query(`insert into child_profiles (child_id, vocab_band) values ($1,$2)`, [child.id, bandForGrade(c.grade)]);
    await q.query(`insert into learning_streaks (child_id) values ($1)`, [child.id]);
    await q.query(`insert into child_rewards (child_id, slug) select $1, slug from rewards where starter on conflict do nothing`, [child.id]);
    await q.query(`insert into child_avatars (child_id) values ($1) on conflict do nothing`, [child.id]);
    return child.id;
  });
}

export async function sendVerification(parentId: string, email: string, childName: string) {
  const token = randomToken();
  await query(`insert into auth_tokens (token_hash, parent_id, purpose, expires_at) values ($1,$2,'verify_email', now() + interval '24 hours')`, [sha256(token), parentId]);
  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/verify?token=${encodeURIComponent(token)}`;
  await sendEmail(
    email,
    "Verify your e-mail to open PING VIBE",
    emailLayout(
      `One quick step for ${escapeHtml(childName)}'s adventure!`,
      `<p style="color:#EAE4FF;line-height:1.6">Please verify your e-mail address. Next, you'll review our privacy notice, give parental consent and set ${escapeHtml(childName)}'s secret PIN.</p>
       <p style="margin:28px 0"><a href="${url}" style="background:#7047FF;color:#fff;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:bold">Verify e-mail</a></p>
       <p style="color:#9a93c9;font-size:13px">This link expires in 24 hours. If you didn't sign up, you can ignore this e-mail.</p>`,
    ),
  );
}

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function assertGrade(grade: string) {
  const g = await one(`select 1 from grade_config where grade = $1 and active`, [grade]);
  if (!g) throw new Error("grade");
}

export async function activeGrades() {
  return query<{ grade: string; label: string }>(`select grade, label from grade_config where active order by sort_order`);
}

export async function registerParent(email: string, password: string) {
  const row = await one<{ id: string }>(
    `insert into parents (email, password_hash) values ($1,$2) returning id`,
    [email.toLowerCase().trim(), await hashPassword(password)],
  );
  return row!.id;
}

export const CONSENT_VERSION = "2026-10-dpdp-v1";
export const CONSENT_SCOPES = ["learning_data", "ai_feedback", "speech_in_browser"] as const;
