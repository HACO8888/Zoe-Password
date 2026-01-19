const fs = require("fs");
const { Pool } = require("pg");

const file = process.argv[2];
if (!file) { console.error("usage: node scripts/run-sql.cjs <file.sql>"); process.exit(1); }
const sql = fs.readFileSync(file, "utf8");

const pool = new (require("pg").Pool)({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.FORCE_PG_SSL === "true" ? { rejectUnauthorized: false } : false,
});

(async () => {
  const c = await pool.connect();
  try { await c.query(sql); console.log("OK"); }
  catch (e) { console.error(e); process.exit(1); }
  finally { c.release(); await pool.end(); }
})();
