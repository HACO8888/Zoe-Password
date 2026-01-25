export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET() {
  const r = await q(
    "SELECT id, title, subtitle, password, created_at FROM passwords ORDER BY (id=1) DESC, id ASC"
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: Request) {
  const b = await req.json();
  const title = typeof b?.title === "string" ? b.title : "未命名關卡";
  const subtitle = typeof b?.subtitle === "string" ? b.subtitle : "";
  if (typeof b?.password !== "string" || b.password.length === 0) {
    return NextResponse.json({ error: "invalid password" }, { status: 400 });
  }
  const r = await q(
    "INSERT INTO passwords (title, subtitle, password) VALUES ($1,$2,$3) RETURNING id, title, subtitle, password, created_at",
    [title, subtitle, b.password]
  );
  return NextResponse.json(r.rows[0], { status: 201 });
}
