import React from "react";

type Props = React.PropsWithChildren<{ plain?: boolean }>;

export default function FrameShell({ children, plain = false }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: plain ? "1fr" : "48px 1fr",
        height: "100vh",
        fontFamily: "Inter, system-ui, Arial"
      }}
    >
      {!plain && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            borderBottom: "1px solid #3c3c3c"
          }}
        >
          <strong>Workbench</strong>
          <span style={{ opacity: 0.6 }}>
            — изолированное превью (добавь &plain=1 к URL, чтобы скрыть хром)
          </span>
        </div>
      )}
      <div style={{ minHeight: 0 }}>{children}</div>
    </div>
  );
}
