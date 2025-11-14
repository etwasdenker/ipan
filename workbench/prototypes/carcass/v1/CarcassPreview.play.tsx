/// <reference types="vite/client" />
import * as React from "react";

export default function CarcassPreviewPlay() {
  const [theme, setTheme] = React.useState<string>(() =>
    localStorage.getItem("wb.theme") || document.documentElement.getAttribute("data-wb-theme") || "dark"
  );

  React.useEffect(() => {
    const onSet = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev.detail?.theme) setTheme(ev.detail.theme);
    };
    window.addEventListener("wb:theme:set", onSet as EventListener);
    return () => window.removeEventListener("wb:theme:set", onSet as EventListener);
  }, []);

  const src = `/lab/carcass/index.html?theme=${encodeURIComponent(theme)}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--wb-app-bg)" }}>
      <iframe
        key={src}                 // форсируем перезагрузку при смене темы
        title="Carcass V1"
        src={src}
        style={{ border: "none", width: "100%", height: "100%" }}
      />
    </div>
  );
}
