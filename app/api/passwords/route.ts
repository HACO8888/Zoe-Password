import { NextResponse } from "next/server";
import { q } from "@/lib/db";

export async function GET() {
  const r = await q(
    "SELECT id, password, created_at FROM passwords ORDER BY id DESC"
  );
  return NextResponse.json(r.rows);
}

export async function POST(req: Request) {
  const b = await req.json();
  if (!b?.password || typeof b.password !== "string") {
    return NextResponse.json({ error: "invalid password" }, { status: 400 });
  }
  const r = await q(
    "INSERT INTO passwords (password) VALUES ($1) RETURNING id, password, created_at",
    [b.password]
  );
  return NextResponse.json(r.rows[0], { status: 201 });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
