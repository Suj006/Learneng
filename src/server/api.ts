import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import type { ZodType } from "zod";
import { currentAdmin, currentChild, currentParent, type ChildCtx, type ParentCtx } from "./session";

export class HttpError extends Error {
  constructor(public status: number, message: string, public extra?: Record<string, unknown>) { super(message); }
}

export const ok = (data: unknown = { ok: true }, status = 200) => NextResponse.json(data, { status });

/** Same-origin check for state-changing requests (defence-in-depth on top of SameSite cookies). */
async function assertSameOrigin(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return;
  const origin = req.headers.get("origin");
  if (!origin) return; // non-browser clients; cookies are SameSite=Lax anyway
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host || new URL(origin).host !== host) throw new HttpError(403, "Cross-site request blocked.");
}

export async function body<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try { raw = await req.json(); } catch { throw new HttpError(400, "Invalid request."); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new HttpError(400, first?.message && first.message !== "Required" ? first.message : `Please check “${first?.path.join(".") || "the form"}”.`);
  }
  return parsed.data;
}

type Handler<C> = (req: NextRequest, ctx: C, params: any) => Promise<Response>;

function wrap<C>(resolve: () => Promise<C | null>, fn: Handler<C>) {
  return async (req: NextRequest, route: { params: Promise<any> }) => {
    try {
      await assertSameOrigin(req);
      const ctx = await resolve();
      if (ctx === null) throw new HttpError(401, "Please log in again.");
      return await fn(req, ctx, route?.params ? await route.params : {});
    } catch (e) {
      if (e instanceof HttpError) return NextResponse.json({ error: e.message, ...e.extra }, { status: e.status });
      console.error("[api]", req.method, req.nextUrl.pathname, e);
      return NextResponse.json({ error: "Oops! Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export const publicRoute = (fn: Handler<{}>) => wrap(async () => ({}), fn);
export const childRoute = (fn: Handler<ChildCtx>) => wrap(currentChild, fn);
export const parentRoute = (fn: Handler<ParentCtx>) => wrap(currentParent, fn);
export const adminRoute = (fn: Handler<{ id: string; email: string; name: string }>) => wrap(currentAdmin, fn);

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
}
