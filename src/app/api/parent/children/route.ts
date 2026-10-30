import { body, HttpError, ok, parentRoute } from "@/server/api";
import { childDetails } from "@/lib/validation";
import { one } from "@/server/db";
import { assertGrade, createPendingChild } from "@/server/accounts";

export const POST = parentRoute(async (req, parent) => {
  const d = await body(req, childDetails);
  await assertGrade(d.grade).catch(() => { throw new HttpError(400, "Please choose a grade."); });
  const n = await one<{ n: number }>(`select count(*)::int n from children where parent_id = $1`, [parent.id]);
  if ((n?.n ?? 0) >= 5) throw new HttpError(400, "A family account can have up to 5 Explorers.");
  const id = await createPendingChild(parent.id, { name: d.childName, birthMonth: d.birthMonth, birthYear: d.birthYear, grade: d.grade });
  return ok({ ok: true, childId: id, redirect: "/parent/consent" });
});
