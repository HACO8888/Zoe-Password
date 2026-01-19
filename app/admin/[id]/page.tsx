"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Notice = { type: "ok" | "err"; text: string };

export default function AdminEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [currPwd, setCurrPwd] = useState<string | null>(null);
  const [currTitle, setCurrTitle] = useState<string | null>(null);
  const [pwd, setPwd] = useState("");
  const [title, setTitle] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "err">("idle");
  const [notice, setNotice] = useState<Notice | null>(null);

  const showNotice = (n: Notice) => {
    setNotice(n);
    const t = setTimeout(() => setNotice(null), 2500);
    return () => clearTimeout(t);
  };

  const load = async () => {
    try {
      const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setCurrPwd(d.password ?? null);
      setCurrTitle(d.title ?? null);
    } catch {
      setCurrPwd(null);
      setCurrTitle(null);
      showNotice({ type: "err", text: "載入失敗" });
    }
  };

  useEffect(() => { load(); }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    try {
      const body: Record<string, string> = {};
      if (pwd) body.password = pwd;
      if (title) body.title = title;
      if (!Object.keys(body).length) throw new Error("no-fields");
      const r = await fetch(`/api/passwords/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error();
      setPwd("");
      setTitle("");
      setState("saved");
      showNotice({ type: "ok", text: "已更新" });
      await load();
    } catch {
      setState("err");
      showNotice({ type: "err", text: "更新失敗或未填寫欄位" });
    }
  };

  return (
    <main className="main">
      {/* 通知 Bar */}
      {notice && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(17,24,39,.14)",
              border: "1px solid",
              borderColor: notice.type === "ok" ? "#bbf7d0" : "#fecaca",
              background: notice.type === "ok" ? "#f0fdf4" : "#fef2f2",
              color: notice.type === "ok" ? "#166534" : "#991b1b",
              minWidth: 220,
              fontWeight: 700,
            }}
          >
            <span>{notice.text}</span>
            <button
              onClick={() => setNotice(null)}
              style={{
                marginLeft: "auto",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "inherit",
                fontWeight: 700,
              }}
              aria-label="關閉通知"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h1 className="title">編輯 關卡 {String(id)}</h1>
        <p className="desc">
          {currTitle !== null ? `目前標題：${currTitle}` : "載入標題失敗"}
          <br />
          {currPwd !== null ? `目前密碼：${currPwd}` : "載入密碼失敗"}
        </p>
        <form className="form" onSubmit={onSubmit}>
          <input
            className="input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="輸入新標題（可留空不改）"
            autoComplete="off"
          />
          <input
            className="input"
            type="text"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="輸入新密碼（可留空不改）"
            autoComplete="off"
          />
          <div className="row">
            <button type="button" className="btn" onClick={() => router.push("/admin")}>返回管理</button>
            <button className="btn" type="submit" disabled={state === "saving"}>
              {state === "saving" ? "更新中…" : "更新"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
