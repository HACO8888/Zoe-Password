// app/api/passwords/[id]/route.ts
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
      "SELECT id, password, created_at FROM passwords WHERE id=$1",
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
    if (typeof b?.password !== "string")
      return NextResponse.json({ error: "invalid password" }, { status: 400 });
    const r = await q(
      "UPDATE passwords SET password=$1 WHERE id=$2 RETURNING id, password, created_at",
      [b.password, id]
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

export async function DELETE(_req: Request, ctx: { params: P | Promise<P> }) {
  try {
    const id = await getId(ctx.params);
    const r = await q("DELETE FROM passwords WHERE id=$1 RETURNING id", [id]);
    if (!r.rowCount)
      return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.message === "invalid-id")
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
