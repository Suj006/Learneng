import { z } from "zod";
import { body, childRoute, ok } from "@/server/api";
import { chooseAdventure } from "@/server/adventure";

export const POST = childRoute(async (req, child) => {
  const { choice } = await body(req, z.object({ choice: z.enum(["vocabulary", "grammar", "story", "speaking", "mystery"]) }));
  return ok(await chooseAdventure(child.id, child.grade, choice));
});
