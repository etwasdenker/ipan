/// <reference types="vite/client" />
import * as React from "react";
import MenuWidget, { MenuConfig } from "./MenuWidget";

const PROTO_ID = "menu-v1";

/** ЕДИНЫЙ источник: соседний файл ./menu.config.json (raw-текст) */
const RAW_CONFIG_TEXT: string = ((): string => {
  const mods = import.meta.glob("./menu.config.json", { as: "raw", eager: true }) as Record<string, string>;
  return mods["./menu.config.json"] || "{}";
})();

/** Подгрузка google-font из cfg.ui.fontHref — только для виджета */
function useFontLink(href?: string) {
  React.useEffect(() => {
    if (!href) return;
    const p1 = document.createElement("link"); p1.rel = "preconnect"; p1.href = "https://fonts.googleapis.com";
    const p2 = document.createElement("link"); p2.rel = "preconnect"; p2.href = "https://fonts.gstatic.com"; p2.crossOrigin = "anonymous";
    const ln = document.createElement("link"); ln.rel = "stylesheet"; ln.href = href;
    document.head.appendChild(p1); document.head.appendChild(p2); document.head.appendChild(ln);
    return () => { document.head.removeChild(p1); document.head.removeChild(p2); document.head.removeChild(ln); };
  }, [href]);
}

export default function MenuPlay() {
  const [cfg, setCfg] = React.useState<MenuConfig>(() => {
    try { return JSON.parse(RAW_CONFIG_TEXT) as MenuConfig; } catch { return { ui: {}, groups: [] }; }
  });
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [previewCollapsed, setPreviewCollapsed] = React.useState<boolean>(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("collapsed") === "1";
  });

  // HMR для menu.config.json (обновление без перезапуска)
  if (import.meta.hot) {
    import.meta.hot.accept("./menu.config.json", (mod: any) => {
      try {
        const text: string = (mod?.default ?? RAW_CONFIG_TEXT) as string;
        setCfg(JSON.parse(text) as MenuConfig);
      } catch {}
    });
  }

  // Связь с панелью Workbench (получить/применить конфиг, переключить превью)
  React.useEffect(() => {
    const onReq = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.target && ev.detail.target !== PROTO_ID) return;
      const text = JSON.stringify(cfg ?? { ui: {}, groups: [] }, null, 2);
      window.dispatchEvent(new CustomEvent("wb:tools:provide-config", { detail: { target: PROTO_ID, text } }));
    };
    const onApply = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.target !== PROTO_ID) return;
      const next = ev.detail?.config as MenuConfig | undefined;
      if (next) setCfg(next);
    };
    const onCollapse = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.target && ev.detail.target !== PROTO_ID) return;
      setPreviewCollapsed(!!ev.detail?.collapsed);
    };
    window.addEventListener("wb:tools:request-config", onReq as EventListener);
    window.addEventListener("wb:config:update", onApply as EventListener);
    window.addEventListener("wb:preview:set-collapsed", onCollapse as EventListener);
    return () => {
      window.removeEventListener("wb:tools:request-config", onReq as EventListener);
      window.removeEventListener("wb:config:update", onApply as EventListener);
      window.removeEventListener("wb:preview:set-collapsed", onCollapse as EventListener);
    };
  }, [cfg]);

  // Подключаем шрифт виджета из конфига
  useFontLink((cfg.ui as any)?.fontHref);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <MenuWidget
        config={cfg}
        activeKey={activeKey}
        onSelect={setActiveKey}
        preview={{ collapsed: previewCollapsed }}
        resolveIconUrl={() => "/brand/folder.svg"}
      />
    </div>
  );
}
