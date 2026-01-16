"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [curr, setCurr] = useState<string | null>(null);
  const [pwd, setPwd] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "err">("idle");

  const load = async () => {
    try {
      const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCurr(d.password);
    } catch {
      setCurr(null);
    }
  };

  useEffect(() => { load(); }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    try {
      const r = await fetch(`/api/passwords/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      if (!r.ok) throw new Error();
      setPwd("");
      setState("saved");
      await load();
    } catch {
      setState("err");
    }
  };

  return (
    <main className="main">
      <div className="card">
        <h1 className="title">編輯 關卡 {String(id)}</h1>
        <p className="desc">{curr !== null ? `目前密碼：${curr}` : "載入當前密碼失敗"}</p>
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
            <button type="button" className="btn" onClick={() => router.push("/admin")}>返回管理</button>
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
