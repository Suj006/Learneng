import { childRoute, ok } from "@/server/api";
import { myWords } from "@/server/vocab";

export const GET = childRoute(async (_req, child) => ok({ words: await myWords(child.id) }));
