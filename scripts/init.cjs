const fs = require("fs");
const { Pool } = require("pg");

const sql = fs.readFileSync("init.sql", "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("DB init done");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();
