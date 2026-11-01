import { childRoute, ok } from "@/server/api";
import { recommendations } from "@/server/recommend";

/** The child's own recommendations (5 categories, each with a child-friendly reason). */
export const GET = childRoute(async (_req, child) => ok({ recommendations: await recommendations(child) }));
