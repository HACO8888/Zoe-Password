"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = { id: number; title: string };

export default function AdminHome() {
  const [list, setList] = useState<Row[]>([]);
  const [title, setTitle] = useState("");        // 新增：標題輸入
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = async () => {
    const r = await fetch("/api/passwords", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      const list = d.map((x: any) => ({ id: x.id, title: String(x.title || "") })); // 帶入 title
      list.sort((a: any, b: any) => (a.id === 1 ? -1 : b.id === 1 ? 1 : a.id - b.id));
      setList(list);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const r = await fetch("/api/passwords", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title || "未命名關卡", password: pwd }), // 新增：一起送 title
      });
      if (!r.ok) throw new Error();
      const j = await r.json();
      setTitle("");  // 清空標題
      setPwd("");
      setMsg(`已新增關卡 ${j.id}`);
      await load();
    } catch {
      setMsg("新增失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main">
      <div className="card">
        <div className="row" style={{ marginBottom: 12 }}>
          <h1 className="title-admin" style={{ margin: 0 }}>管理關卡</h1>
          <button
            className="btn"
            type="button"
            onClick={() => router.push("/")}
            aria-label="返回題目選擇"
          >
            返回題目選擇
          </button>
        </div>

        <p className="desc-admin">新增關卡或選擇關卡進行編輯</p>

        <form className="form" onSubmit={create}>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="關卡標題"
            minLength={1}
            autoComplete="off"
          />
          <input
            className="input"
            type="text"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="新關卡的初始密碼"
            autoComplete="off"
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "新增中…" : "新增關卡"}
          </button>
        </form>
        {!!msg && <div className="msg">{msg}</div>}

        <div style={{ marginTop: 20, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
          {list.map((r) => (
            <button key={r.id} className="btn" onClick={() => router.push(`/admin/${r.id}`)}>
              {(r.title) || " "}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
