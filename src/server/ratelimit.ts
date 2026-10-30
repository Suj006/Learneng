import "server-only";
import { one } from "./db";

/**
 * Fixed-window rate limiter backed by Postgres (works across serverless instances).
 * Returns true when the call is allowed.
 */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const row = await one<{ hits: number }>(
    `insert into rate_limits (bucket, window_start, hits) values ($1, now(), 1)
     on conflict (bucket) do update set
       hits = case when rate_limits.window_start < now() - make_interval(secs => $2) then 1 else rate_limits.hits + 1 end,
       window_start = case when rate_limits.window_start < now() - make_interval(secs => $2) then now() else rate_limits.window_start end
     returning hits`,
    [bucket, windowSeconds],
  );
  return (row?.hits ?? 0) <= limit;
}

/**
 * Network-scoped limit (many families can share one school/home IP). Test environments,
 * where every client shares one address, may raise it with IP_RATE_LIMIT_MULTIPLIER.
 * Per-account limits (PIN/password lockouts) always use rateLimit() unscaled.
 */
export async function ipRateLimit(bucket: string, limit: number, windowSeconds: number) {
  const m = Math.max(1, Number(process.env.IP_RATE_LIMIT_MULTIPLIER ?? 1));
  return rateLimit(bucket, limit * m, windowSeconds);
}

export async function resetRateLimit(bucket: string) {
  await one(`delete from rate_limits where bucket = $1`, [bucket]);
}
