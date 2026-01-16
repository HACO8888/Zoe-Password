// lib/db.ts
import { Pool } from "pg";

declare global {
  var __pg_pool__: Pool | undefined;
}

function wantSSL(cs: string) {
  try {
    const u = new URL(cs);
    const m = (u.searchParams.get("sslmode") || "").toLowerCase();
    if (m === "disable" || m === "allow") return false;
    if (m === "require" || m === "verify-ca" || m === "verify-full")
      return true;
  } catch {}
  if (process.env.FORCE_PG_SSL === "true") return true;
  if (process.env.FORCE_PG_SSL === "false") return false;
  return false;
}

function createPool() {
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error("DATABASE_URL not set");
  const useSSL = wantSSL(cs);
  return new Pool({
    connectionString: cs,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

const pool = global.__pg_pool__ ?? createPool();
if (process.env.NODE_ENV !== "production") global.__pg_pool__ = pool;

export const q = (text: string, params?: any[]) => pool.query(text, params);
