import * as React from "react";
import { registry } from "../registry";
import "./wb-theme.css";

type Props = { activeId?: string | null; onSelect?: (id: string) => void; };
type Tab = "options" | "tools" | "cabinet" | null;

const OFFSET = 30;
const TOOLBAR_W = 146;
const TOOLBAR_H = 80;
const PANEL_W = 400;
const PANEL_H = 600;

const RADIUS = 20;
const ICON_BOX = 40;
const ICON_GAP = 20;
const ACTIVE_BLUE = "#3D73FF";

const ICONS = {
  options: "/brand/wb_options.svg",
  tools:   "/brand/wb_tools.svg",
  cabinet: "/brand/wb_cabinet.svg",
};

function ToolBtn({ icon, active, title, onClick }:{
  icon: string; active?: boolean; title?: string; onClick?: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: ICON_BOX, height: ICON_BOX,
        borderRadius: 12, marginLeft: ICON_GAP,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        border: "none", cursor: "pointer",
        background: active ? ACTIVE_BLUE : "transparent",
        boxShadow: active ? "0 0 0 2px rgba(0,0,0,0.10) inset" : "none",
        padding: 0,
      }}
    >
      <img
        src={icon}
        alt=""
        style={{
          width: 22, height: 22,
          filter: active ? "none" : "var(--wb-icon-filter)",
        }}
      />
    </button>
  );
}

function OptionsPane() {
  const [theme, setTheme] = React.useState<string>(() => localStorage.getItem("wb.theme") || "dark");

  React.useEffect(() => {
    localStorage.setItem("wb.theme", theme);
    document.documentElement.setAttribute("data-wb-theme", theme);
    window.dispatchEvent(new CustomEvent("wb:theme:set", { detail: { theme } }));
  }, [theme]);

  const toggle = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <div style={{ padding: 16, color: "var(--wb-text)" }}>
      <div style={{ fontFamily: "'Shantell Sans', system-ui", fontSize: 22, marginBottom: 8 }}>Options</div>
      <div style={{ opacity: 0.75, marginBottom: 12 }}>Настройки верстака.</div>

      {/* Триггер темы — одна большая кнопка */}
      <button
        onClick={toggle}
        style={{
          background: ACTIVE_BLUE,
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: "10px 14px",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Theme: {theme === "dark" ? "Dark" : "Light"} — click to toggle
      </button>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Эта же тема позже синхронизируется с IPAN.
      </div>
    </div>
  );
}

function ToolsPane({ targetId }: { targetId: string | null | undefined }) {
  const [text, setText] = React.useState<string>("");

  const requestConfig = React.useCallback(() => {
    if (!targetId) return;
    window.dispatchEvent(new CustomEvent("wb:tools:request-config", { detail: { target: targetId } }));
  }, [targetId]);

  React.useEffect(() => {
    const onProvide = (e: Event) => {
      const ev = e as CustomEvent;
      if (targetId && ev.detail?.target && ev.detail.target !== targetId) return;
      if (typeof ev.detail?.text === "string") setText(ev.detail.text);
    };
    window.addEventListener("wb:tools:provide-config", onProvide as EventListener);
    requestConfig();
    return () => window.removeEventListener("wb:tools:provide-config", onProvide as EventListener);
  }, [targetId, requestConfig]);

  const apply = () => {
    if (!targetId) return;
    try {
      const parsed = JSON.parse(text);
      window.dispatchEvent(new CustomEvent("wb:config:update", { detail: { target: targetId, config: parsed } }));
    } catch {
      alert("JSON некорректен");
    }
  };

  return (
    <div style={{ padding: 12, color: "var(--wb-text)", height: "100%", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 8 }}>
      <div style={{ fontFamily: "'Shantell Sans', system-ui", fontSize: 20, marginBottom: 4 }}>Tools</div>
      <textarea
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%", height: "100%",
          background: "#2b2b2b", color: "#d9e1ff",
          borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
          padding: 10, fontFamily: "ui-monospace, Consolas, monospace", fontSize: 13, outline: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={requestConfig} style={btn("ghost")}>Обновить</button>
        <button onClick={apply} style={btn()}>Применить</button>
      </div>
    </div>
  );
}

function CabinetPane({ activeId, onSelect }:{ activeId?: string | null; onSelect?: (id: string) => void }) {
  const items = registry;
  return (
    <div style={{ padding: 16, color: "var(--wb-text)", height: "100%", display: "grid", gridTemplateColumns: "1fr", gridAutoRows: "min-content", gap: 12 }}>
      <div style={{ fontFamily: "'Shantell Sans', system-ui", fontSize: 22, marginBottom: 4 }}>Cabinet</div>
      <div style={{ opacity: 0.75, marginBottom: 8 }}>Доступные прототипы:</div>

      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <button
              key={it.id}
              onClick={() => onSelect?.(it.id)}
              style={{
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "12px 14px",
                background: active ? "rgba(61,115,255,0.15)" : "rgba(255,255,255,0.03)",
                color: "var(--wb-text)",
                cursor: "pointer",
              }}
              title={it.id}
            >
              <div style={{ fontFamily: "'Shantell Sans', system-ui", fontSize: 18 }}>{it.title || it.id}</div>
              {it.subtitle && <div style={{ opacity: 0.7, fontSize: 13 }}>{it.subtitle}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function btn(kind: "primary" | "ghost" = "primary"): React.CSSProperties {
  if (kind === "ghost") {
    return {
      background: "transparent",
      color: "#dbe2ff",
      border: "1px solid rgba(255,255,255,0.25)",
      borderRadius: 10,
      padding: "8px 12px",
      cursor: "pointer",
    };
  }
  return {
    background: ACTIVE_BLUE,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
  };
}

export default function WorkbenchPanel({ activeId, onSelect }: Props) {
  const [tab, setTab] = React.useState<Tab>(() => (localStorage.getItem("wb.panel.tab") as Tab) || "cabinet");
  React.useEffect(() => { localStorage.setItem("wb.panel.tab", tab || ""); }, [tab]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setTab(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const open = !!tab;

  return (
    <div
      style={{
        position: "fixed",
        right: OFFSET, bottom: OFFSET,
        width: open ? PANEL_W : TOOLBAR_W,
        height: open ? PANEL_H : TOOLBAR_H,
        background: "var(--wb-bg)",
        color: "var(--wb-text)",
        borderRadius: RADIUS,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        overflow: "hidden",
        transition: "width .18s ease, height .18s ease",
        zIndex: 1000,
        fontFamily: "'Shantell Sans', system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      {open && (
        <div style={{ position: "absolute", inset: 0, padding: 10, paddingBottom: TOOLBAR_H }}>
          <div
            style={{
              position: "absolute", left: 10, top: 10, right: 10, bottom: TOOLBAR_H,
              overflow: "hidden", borderRadius: 14,
              background: "var(--wb-card)", backdropFilter: "blur(2px)",
            }}
          >
            {tab === "options" && <OptionsPane />}
            {tab === "tools"   && <ToolsPane targetId={activeId} />}
            {tab === "cabinet" && <CabinetPane activeId={activeId} onSelect={onSelect} />}
          </div>
        </div>
      )}

      <div
        style={{
          position: "absolute", left: 10, right: 10, bottom: 10,
          height: TOOLBAR_H - 20, borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 8px",
        }}
      >
        <ToolBtn icon={ICONS.options} active={tab === "options"} title="Options" onClick={() => setTab(t => t === "options" ? null : "options")} />
        <ToolBtn icon={ICONS.tools}   active={tab === "tools"}   title="Tools"   onClick={() => setTab(t => t === "tools"   ? null : "tools")} />
        <ToolBtn icon={ICONS.cabinet} active={tab === "cabinet"} title="Cabinet" onClick={() => setTab(t => t === "cabinet" ? null : "cabinet")} />
      </div>
    </div>
  );
}
