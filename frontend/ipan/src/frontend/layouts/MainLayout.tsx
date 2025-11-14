import React, { useState } from "react";
import { CarcassShell } from "../carcass/CarcassShell";
import { MenuPanel } from "../widgets/MenuPanel/MenuPanel";

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [section, setSection] = useState<string>("dashboard");

  return (
    <CarcassShell
      header={
        <div
          style={{
            height: "100%",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            color: "#E5E5E5",
            fontFamily: "'Amatic SC', cursive",
            padding: "0 16px",
            gap: 16
          }}
        >
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => history.back()} title="Back">↶</button>
            <button onClick={() => location.reload()} title="Refresh">⟳</button>
            <div style={{ fontSize: 28, letterSpacing: 2 }}>
              {section === "articles" ? "КОНТЕНТ · СТАТЬИ" : "ПАНЕЛЬ · DASHBOARD"}
            </div>
          </div>

          {/* СЕРЕДИНА — пустая, при необходимости сюда перенесём «хлебные крошки» */}
          <div />

          {/* ПРАВАЯ ЧАСТЬ */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22 }}>
            <span title="Пользователь">MASTER</span>
            <span title="DB">🟣</span>
            <time>
              {new Date().toLocaleDateString("ru-RU", {
                day: "2-digit", month: "long", year: "numeric", weekday: "short"
              }).replace(",", "")}
              {" · "}
              {new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
            </time>
          </div>
        </div>
      }
      left={
        <div style={{ height: "100%", display: "grid", gridTemplateRows: "1fr 60px" }}>
          {/* верх меню */}
          <MenuPanel onSelect={setSection} collapsed={collapsed} />
          {/* низ меню: кнопка темы + версия */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8 }}>
            <button onClick={() => document.documentElement.classList.toggle("light")}>☀︎</button>
            <button onClick={() => setCollapsed((v) => !v)} title="Свернуть / раскрыть">≡</button>
            <span style={{ opacity: 0.6 }}>V1.0</span>
          </div>
        </div>
      }
      main={
        <div style={{ padding: 16, color: "#E5E5E5", fontFamily: "'Playpen Sans', cursive" }}>
          {section === "articles" ? "МОДУЛЬ СТАТЕЙ (заглушка)" : "Dashboard (заглушка)"}
        </div>
      }
    />
  );
}
