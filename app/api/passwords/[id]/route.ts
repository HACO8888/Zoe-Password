export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { q } from "@/lib/db";

type P = { id: string };

async function getId(params: P | Promise<P>) {
  const { id } = await Promise.resolve(params);
  const n = Number(id);
  if (!Number.isInteger(n)) throw new Error("invalid-id");
  return n;
}

export async function GET(_req: Request, ctx: { params: P | Promise<P> }) {
  try {
    const id = await getId(ctx.params);
    const r = await q(
      "SELECT id, title, password, created_at FROM passwords WHERE id=$1",
      [id]
    );
    if (!r.rowCount)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(r.rows[0]);
  } catch (e: any) {
    if (e?.message === "invalid-id")
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: { params: P | Promise<P> }) {
  try {
    const id = await getId(ctx.params);
    const b = await req.json();
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (typeof b?.title === "string") {
      fields.push(`title=$${i++}`);
      values.push(b.title);
    }
    if (typeof b?.password === "string") {
      fields.push(`password=$${i++}`);
      values.push(b.password);
    }
    if (!fields.length)
      return NextResponse.json({ error: "no fields" }, { status: 400 });
    values.push(id);
    const r = await q(
      `UPDATE passwords SET ${fields.join(
        ","
      )} WHERE id=$${i} RETURNING id, title, password, created_at`,
      values
    );
    if (!r.rowCount)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(r.rows[0]);
  } catch (e: any) {
    if (e?.message === "invalid-id")
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
