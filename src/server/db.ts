import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Database access layer.
 *  • DATABASE_URL set  → node-postgres pool (Supabase / any PostgreSQL).
 *  • DATABASE_URL empty → embedded PostgreSQL (PGlite) persisted in ./.data —
 *    zero-setup local development using the very same SQL.
 */
export type Row = Record<string, any>;
export interface Queryable {
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}
interface Driver extends Queryable {
  transaction<T>(fn: (q: Queryable) => Promise<T>): Promise<T>;
}

type G = typeof globalThis & { __pvDriver?: Promise<Driver> };
const g = globalThis as G;

async function createDriver(): Promise<Driver> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: url,
      max: 5,
      ssl: url.includes("localhost") || url.includes("127.0.0.1") ? undefined : { rejectUnauthorized: false },
    });
    return {
      query: (sql, params) => pool.query(sql, params as any[]) as any,
      async transaction(fn) {
        const client = await pool.connect();
        try {
          await client.query("begin");
          const out = await fn({ query: (s, p) => client.query(s, p as any[]) as any });
          await client.query("commit");
          return out;
        } catch (e) {
          await client.query("rollback");
          throw e;
        } finally {
          client.release();
        }
      },
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pingvibe");
  if (dir !== "memory://") fs.mkdirSync(dir, { recursive: true });
  const db = await PGlite.create(dir);
  // PGlite is single-connection: serialise transactions so they never interleave.
  let chain: Promise<unknown> = Promise.resolve();
  return {
    query: (sql, params) => db.query(sql, params as any[]) as any,
    transaction<T>(fn: (q: Queryable) => Promise<T>) {
      const run = chain.then(() => db.transaction((tx) => fn({ query: (s, p) => tx.query(s, p as any[]) as any })));
      chain = run.catch(() => undefined);
      return run as Promise<T>;
    },
  };
}

async function boot(): Promise<Driver> {
  const driver = await createDriver();
  const { migrate } = await import("./migrate");
  await migrate(driver);
  const { registerGrades } = await import("@/lib/grades");
  registerGrades((await driver.query<{ grade: string; band: number; label: string }>(`select grade, band, label from grade_config`)).rows);
  return driver;
}

function driver(): Promise<Driver> {
  if (!g.__pvDriver) {
    g.__pvDriver = boot().catch((e) => {
      g.__pvDriver = undefined;
      throw e;
    });
  }
  return g.__pvDriver;
}

export async function query<T extends Row = Row>(sql: string, params: unknown[] = []): Promise<T[]> {
  const d = await driver();
  const res = await d.query<T>(sql, params);
  return res.rows;
}

export async function one<T extends Row = Row>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function tx<T>(fn: (q: Queryable) => Promise<T>): Promise<T> {
  const d = await driver();
  return d.transaction(fn);
}
