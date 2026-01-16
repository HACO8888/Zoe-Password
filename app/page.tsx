"use client";

import { useState } from "react";

export default function Page() {
  const [pwd, setPwd] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err" | "loading">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const r = await fetch("/api/passwords/1", { cache: "no-store" });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setState(pwd === data.password ? "ok" : "err");
    } catch {
      setState("err");
    }
  };

  const reset = () => {
    setPwd("");
    setState("idle");
  };

  return (
    <main className="main">
      <div className="card" aria-hidden={state === "ok" || state === "err"}>
        <h1 className="title">輸入密碼</h1>
        <p className="desc">請輸入關卡密碼，系統會告訴你是否正確</p>
        <form className="form" onSubmit={onSubmit}>
          <input
            className="input"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            inputMode="text"
            autoComplete="off"
            placeholder="在此輸入密碼"
            disabled={state === "ok" || state === "err"}
          />
          <button className="btn" type="submit" disabled={state === "loading" || state === "ok" || state === "err"}>
            {state === "loading" ? "檢查中…" : "檢查"}
          </button>
        </form>
      </div>

      {state === "ok" && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="unlockWrap">
            <div className="unlockTitle">解鎖成功</div>
            <div className="unlockSub">請前往下一關</div>
          </div>
        </div>
      )}

      {state === "err" && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="unlockWrap">
            <div className="errorTitle">密碼錯誤</div>
            <button className="retryBtn" onClick={reset}>重新輸入</button>
          </div>
        </div>
      )}
    </main>
  );
}
