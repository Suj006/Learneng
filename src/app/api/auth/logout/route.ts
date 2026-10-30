import { ok, publicRoute } from "@/server/api";
import { destroySession } from "@/server/session";

export const POST = publicRoute(async () => {
  await destroySession();
  return ok();
});
