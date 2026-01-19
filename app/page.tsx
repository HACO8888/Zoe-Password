"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Row = { id: number; title: string };

export default function Page() {
  const [list, setList] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const router = useRouter();

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/passwords", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const data = await r.json();
      const list: Row[] = data.map((x: any) => ({
        id: x.id,
        title: String(x.title || `關卡 ${x.id}`)
      }));
      list.sort((a, b) => (a.id === 1 ? -1 : b.id === 1 ? 1 : a.id - b.id));
      setList(list);
    } catch {
      setErr("讀取失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <main className="main">
      <div className="card">
        <div className="row" style={{ alignItems: "center" }}>
          <h1 className="title-admin">選擇關卡</h1>
          <button className="btn btn--outline btn--sm" onClick={load}>重新整理</button>
        </div>
        <p className="desc-admin">請選擇要進行闖關的關卡按鈕</p>

        {loading && <div className="msg">載入中…</div>}
        {!!err && <div className="msg err">{err}</div>}

        {!loading && !err && (
          <div className="gridList">
            {list.map((r) => (
              <button
                key={r.id}
                className="pill cursor-pointer"
                onClick={() => router.push(`/${r.id}`)}
              >
                {r.title || `關卡 ${r.id}`}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
