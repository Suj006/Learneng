import { z } from "zod";
import { body, HttpError, ok, parentRoute } from "@/server/api";
import { one, tx } from "@/server/db";
import { hashPassword } from "@/server/crypto";
import { pinSchema } from "@/lib/validation";
import { CONSENT_SCOPES, CONSENT_VERSION } from "@/server/accounts";

/** Verifiable parental consent (DPDP Act 2023 §9) + child PIN set-up → activates the child. */
export const POST = parentRoute(async (req, parent) => {
  const d = await body(req, z.object({
    childId: z.string().uuid(),
    pin: pinSchema,
    consents: z.object({ learning_data: z.literal(true, { error: "Consent to process learning data is required to use PING VIBE." }), ai_feedback: z.boolean(), speech_in_browser: z.boolean() }),
  }));
  if (!parent.email_verified_at) throw new HttpError(403, "Please verify your e-mail first.");
  const child = await one<{ id: string; username: string; status: string }>(`select id, username, status from children where id = $1 and parent_id = $2`, [d.childId, parent.id]);
  if (!child) throw new HttpError(404, "Child not found.");
  const scopes = CONSENT_SCOPES.filter((s) => d.consents[s]);
  await tx(async (q) => {
    await q.query(`update children set pin_hash = $2, status = 'active', updated_at = now() where id = $1`, [child.id, await hashPassword(d.pin)]);
    await q.query(`insert into consent_records (parent_id, child_id, consent_version, scopes) values ($1,$2,$3,$4)`, [parent.id, child.id, CONSENT_VERSION, scopes]);
    await q.query(`update parents set consent_given_at = coalesce(consent_given_at, now()), companion_enabled = $2 where id = $1`, [parent.id, d.consents.ai_feedback]);
  });
  return ok({ ok: true, username: child.username });
});
