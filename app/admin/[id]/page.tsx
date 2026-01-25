"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [curr, setCurr] = useState<{ title: string; subtitle: string; password: string } | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      const t = String(d.title || "");
      const s = String(d.subtitle || "");
      const p = String(d.password || "");
      setCurr({ title: t, subtitle: s, password: p });
      setTitle(t);         // 預設填入現值
      setSubtitle(s);      // 預設填入現值
      setPwd("");          // 密碼不預設顯示
    } catch {
      setCurr(null);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curr) return;
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (title !== curr.title) body.title = title;
      if (subtitle !== curr.subtitle) body.subtitle = subtitle;
      if (pwd) body.password = pwd;
      if (!Object.keys(body).length) throw new Error("no-fields");

      const r = await fetch(`/api/passwords/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();

      await load();
      setPwd("");
      alert("已更新");
    } catch {
      alert("更新失敗或未填寫欄位");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="main">
      <div className="card">
        <div className="adminHeader">
          <h1 className="adminTitle">編輯 關卡 {String(id)}</h1>
          <div className="adminToolbar">
            <button className="btn btn--outline btn--sm" onClick={() => router.push("/admin")}>返回管理</button>
            <button className="btn btn--outline btn--sm" onClick={load}>重新整理</button>
          </div>
        </div>

        <div className="adminSection">
          <div className="kv">
            <div className="kvRow">
              <div className="kvKey">標題：</div>
              <div className="kvVal">{curr?.title}</div>
            </div>
            <div className="kvRow">
              <div className="kvKey">副標題：</div>
              <div className="kvVal">{curr?.subtitle}</div>
            </div>
            <div className="kvRow">
              <div className="kvKey">密碼：</div>
              <div className="kvVal kvPwd">{curr?.password}</div>
            </div>
          </div>
        </div>

        <div className="adminSection">
          <form className="adminForm" onSubmit={onSubmit}>
            <input
              className="input adminInput"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="新標題（可留空不改）"
              autoComplete="off"
            />
            <input
              className="input adminInput"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="新紅色副標（留空可清空）"
              autoComplete="off"
            />
            <input
              className="input adminInput"
              type="text"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="新密碼（可留空不改）"
              autoComplete="off"
            />
            <button className="btn-admin btn--primary" type="submit" disabled={saving}>
              {saving ? "更新中…" : "更新"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
