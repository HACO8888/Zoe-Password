"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PuzzlePage() {
  const params = useParams();
  const id = String(params.id);
  const [title, setTitle] = useState<string>("");
  const [pwd, setPwd] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err" | "loading">("idle");

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
        if (!r.ok) throw new Error();
        const d = await r.json();
        setTitle(String(d.title || `關卡 ${id}`));
      } catch {
        setTitle(`關卡 ${id}`);
      }
    };
    load();
  }, [id]);

  const press = (v: string) => {
    if (state === "ok" || state === "err") return;
    if (v === "CLR") { setPwd(""); return; }
    if (v === "DEL") { setPwd((s) => s.slice(0, -1)); return; }
    if (v === "OK") { submit(); return; }
    setPwd((s) => (s + v).slice(0, 20));
  };

  const submit = async () => {
    setState("loading");
    try {
      const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
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
        <h1 className="title">{title || `關卡 ${id}`}</h1>
        <p className="desc">請使用數字鍵盤輸入正確的密碼</p>

        <div className="pinDisplay">{pwd || "　"}</div>

        <div className="keypad" aria-hidden={state === "loading"}>
          <button className="key" onClick={() => press("1")}>1</button>
          <button className="key" onClick={() => press("2")}>2</button>
          <button className="key" onClick={() => press("3")}>3</button>
          <button className="key" onClick={() => press("4")}>4</button>
          <button className="key" onClick={() => press("5")}>5</button>
          <button className="key" onClick={() => press("6")}>6</button>
          <button className="key" onClick={() => press("7")}>7</button>
          <button className="key" onClick={() => press("8")}>8</button>
          <button className="key" onClick={() => press("9")}>9</button>
          <button className="key keyDanger" onClick={() => press("CLR")}>清空</button>
          <button className="key" onClick={() => press("0")}>0</button>
          <button className="key" onClick={() => press("DEL")}>刪除</button>
          <button className="key keyWide keyPrimary" onClick={() => press("OK")}>送出</button>
        </div>
      </div>

      {state === "ok" && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="unlockWrap">
            <div className="unlockTitle">解鎖成功</div>
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
