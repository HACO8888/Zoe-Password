"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = { id: number; title: string; subtitle: string };

export default function AdminHome() {
  const [list, setList] = useState<Row[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = async () => {
    const r = await fetch("/api/passwords", { cache: "no-store" });
    if (r.ok) {
      const d = await r.json();
      const items: Row[] = d.map((x: any) => ({
        id: x.id,
        title: String(x.title || ""),
        subtitle: String(x.subtitle || ""),
      }));
      items.sort((a, b) => (a.id === 1 ? -1 : b.id === 1 ? 1 : a.id - b.id));
      setList(items);
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
        body: JSON.stringify({
          title: title || "未命名關卡",
          subtitle: subtitle || "",
          password: pwd,
        }),
      });
      if (!r.ok) throw new Error();
      const j = await r.json();
      setTitle("");
      setSubtitle("");
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
        <div className="adminHeader">
          <h1 className="adminTitle">管理關卡</h1>
          <div className="adminToolbar">
            <button className="btn btn--outline btn--sm" onClick={() => router.push("/")}>返回題目選擇</button>
            <button className="btn btn--outline btn--sm" onClick={load}>重新整理</button>
          </div>
        </div>

        <p className="desc-admin">新增關卡或選擇關卡進行編輯</p>

        <div className="adminSection">
          <form className="adminForm" onSubmit={create}>
            <input
              className="input adminInput"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="關卡標題"
              autoComplete="off"
            />
            <input
              className="input adminInput"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="紅色副標（可空）"
              autoComplete="off"
            />
            <input
              className="input adminInput"
              type="text"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="初始密碼"
              autoComplete="off"
            />
            <button className="btn-admin btn--primary" type="submit" disabled={loading}>
              {loading ? "新增中…" : "新增關卡"}
            </button>
          </form>
          {!!msg && <div className="adminHint">{msg}</div>}
        </div>

        <div className="adminSection">
          <div className="adminList">
            {list.map((r) => (
              <button
                key={r.id}
                className="adminChip"
                onClick={() => router.push(`/admin/${r.id}`)}
                title={`編輯：${r.title}`}
              >
                {`關卡 ${r.id}｜${r.title}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
