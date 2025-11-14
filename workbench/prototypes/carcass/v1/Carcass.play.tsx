/// <reference types="vite/client" />
import * as React from "react";
export { default } from "./CarcassPreview.play";
/** Сырый HTML берём из соседнего index.html */
const html: string = (() => {
  const mods = import.meta.glob("./index.html", { as: "raw", eager: true }) as Record<string, string>;
  return mods["./index.html"] || "<!doctype html><html><body>index.html не найден</body></html>";
})();

export default function CarcassPlay() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <iframe
        title="Carcass V1"
        srcDoc={html}
        style={{ border: "none", width: "100%", height: "100%" }}
      />
    </div>
  );
}
