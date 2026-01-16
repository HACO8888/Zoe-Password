"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [pwd, setPwd] = useState("");
  const [curr, setCurr] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "err">("idle");

  useEffect(() => {
    const f = async () => {
      try {
        const r = await fetch("/api/passwords/1", { cache: "no-store" });
        if (!r.ok) throw new Error();
        const d = await r.json();
        setCurr(d.password);
      } catch {
        setCurr(null);
      }
    };
    f();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    try {
      const r = await fetch("/api/passwords/1", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!r.ok) throw new Error();
      setPwd("");
      setState("saved");
      const d = await fetch("/api/passwords/1", { cache: "no-store" });
      if (d.ok) {
        const j = await d.json();
        setCurr(j.password);
      }
    } catch {
      setState("err");
    }
  };

  return (
    <main className="main">
      <div className="card">
        <h1 className="title">管理密碼（ID 1）</h1>
        <p className="desc">{curr !== null ? `目前密碼：${curr}` : "目前密碼載入失敗"}</p>
        <form className="form" onSubmit={onSubmit}>
          <input
            className="input"
            type="text"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="輸入新密碼"
            autoComplete="off"
          />
          <div className="row">
            <a className="btn" href="/">返回首頁</a>
            <button className="btn" type="submit" disabled={state === "saving"}>
              {state === "saving" ? "更新中…" : "更新密碼"}
            </button>
          </div>
        </form>
        {state === "saved" && <div className="msg ok">已更新</div>}
        {state === "err" && <div className="msg err">更新失敗</div>}
      </div>
    </main>
  );
}
