-- ════════════════════════════════════════════════════════════════════════
-- PING VIBE — Supabase hardening. Run AFTER schema.sql on Supabase.
--
-- PING VIBE talks to Postgres only from trusted server code (Next.js route
-- handlers / server components) using the DATABASE_URL connection, which
-- bypasses RLS as table owner. Children's data must NEVER be reachable from
-- the browser through Supabase's auto-generated REST/GraphQL APIs, so RLS is
-- enabled on every table with NO policies for the `anon` / `authenticated`
-- roles = deny-all. Add narrowly-scoped policies only if you deliberately
-- expose a table to the client SDK later.
-- ════════════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
