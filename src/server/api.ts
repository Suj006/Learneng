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

const MAX_BODY = 64 * 1024;

export async function body<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_BODY) throw new HttpError(413, "That's too much at once! Please send something shorter.");
    raw = JSON.parse(text);
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, "Invalid request.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path.join(".") || "the form";
    // Custom messages are written for families; zod's technical defaults are replaced by a friendly one.
    const technical = !first?.message || /^Invalid|^Too (small|big)|expected|received/i.test(first.message);
    throw new HttpError(400, technical ? `Please check “${field}”.` : first.message, first?.path.length ? { field } : undefined);
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

/**
 * Client IP for rate limiting. Never trusts the client-controlled left-most X-Forwarded-For
 * entry: prefers headers set by the platform (Vercel), else the right-most hop appended by
 * the nearest trusted proxy.
 */
export async function clientIp() {
  return pickClientIp(await headers());
}

export function pickClientIp(h: Pick<Headers, "get">) {
  const platform = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip");
  if (platform) return platform.split(",")[0].trim();
  const hops = (h.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return hops[hops.length - 1] ?? "local";
}
