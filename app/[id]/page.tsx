"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PuzzlePage() {
  const params = useParams();
  const id = String(params.id);
  const [title, setTitle] = useState<string>("");
  const [subtitle, setSubtitle] = useState<string>("");
  const [pwd, setPwd] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err" | "loading">("idle");
  const [notFound, setNotFound] = useState(false); // ← 新增：題目是否不存在

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
        if (r.status === 404) {            // ← 404：題目不存在
          setNotFound(true);
          return;
        }
        if (!r.ok) throw new Error();
        const d = await r.json();
        setTitle(String(d.title || `關卡 ${id}`));
        setSubtitle(String(d.subtitle || ""));
      } catch {
        // 無法連線等錯誤時也視為不存在，避免玩家卡住
        setNotFound(true);
      }
    };
    load();
  }, [id]);

  const press = (v: string) => {
    if (state === "ok" || state === "err" || notFound) return;
    if (v === "CLR") { setPwd(""); return; }
    if (v === "DEL") { setPwd((s) => s.slice(0, -1)); return; }
    if (v === "OK") { submit(); return; }
    setPwd((s) => (s + v).slice(0, 20));
  };

  const submit = async () => {
    if (notFound) return; // 題目不存在就不檢查
    setState("loading");
    try {
      const r = await fetch(`/api/passwords/${id}`, { cache: "no-store" });
      if (r.status === 404) { setNotFound(true); setState("idle"); return; }
      if (!r.ok) throw new Error();
      const data = await r.json();
      setState(pwd === data.password ? "ok" : "err");
    } catch {
      setNotFound(true);
      setState("idle");
    }
  };

  const reset = () => {
    setPwd("");
    setState("idle");
  };

  return (
    <main className="main">
      <div className="card" aria-hidden={state === "ok" || state === "err" || notFound}>
        <h1 className="title">{title || " "}</h1>
        <p className="desc">請使用數字鍵盤輸入正確的密碼</p>
        {subtitle && <p className="descDanger">{subtitle}</p>}

        <div className="pinDisplay">{pwd || "　"}</div>

        <div className="keypad" aria-hidden={state === "loading" || notFound}>
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

      {notFound && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="unlockWrap">
            <div className="errorTitle">題目不存在</div>
          </div>
        </div>
      )}

      {state === "ok" && !notFound && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="unlockWrap">
            <div className="unlockTitle">解鎖成功</div>
          </div>
        </div>
      )}

      {state === "err" && !notFound && (
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
