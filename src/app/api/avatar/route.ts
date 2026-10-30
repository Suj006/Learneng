import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { saveAvatar } from "@/server/avatar";

const s = z.string().max(60);
export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ skin: s, hair: s, hair_color: s, outfit: s, shoes: s, accessory: s.nullable(), background: s, expression: s, magic_object: s.nullable(), celebration: s }));
  const err = await saveAvatar(child.id, d);
  if (err) throw new HttpError(400, err);
  return ok();
});
