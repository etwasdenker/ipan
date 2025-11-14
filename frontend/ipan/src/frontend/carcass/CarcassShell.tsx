import React, { ReactNode } from "react";
import cfg from "./configs/main-carcass.json";
import { CarcassConfig } from "./types";

type Areas = {
  header?: ReactNode;
  left?: ReactNode;
  main?: ReactNode;
  right?: ReactNode;
};

const config = cfg as CarcassConfig;

export function CarcassShell({ header, left, main, right }: Areas) {
  const gridCols = `${config.leftWidth}px 1fr ${Math.max(config.rightWidth ?? 0, 0)}px`;
  const gridRows = `${config.headerHeight}px 1fr`;

  const line = `1px solid ${config.colors.line}`;

  return (
    <div
      style={{
        height: "100vh",
        background: config.colors.bodyBg,
        display: "grid",
        gridTemplateColumns: gridCols,
        gridTemplateRows: gridRows,
        gridTemplateAreas: `"header header header" "left main right"`
      }}
    >
      {/* HEADER */}
      <div
        style={{
          gridArea: "header",
          background: config.colors.headerBg,
          borderBottom: config.showHeaderDivider ? line : "none"
        }}
      >
        {header}
      </div>

      {/* LEFT */}
      <div
        style={{
          gridArea: "left",
          borderRight: config.showLeftDivider ? line : "none",
          overflow: "hidden", // прокрутка внутри самого меню
          background: "transparent"
        }}
      >
        {left}
      </div>

      {/* MAIN */}
      <div style={{ gridArea: "main", overflow: "auto" }}>{main}</div>

      {/* RIGHT (опционально) */}
      {config.rightWidth && config.rightWidth > 0 ? (
        <div style={{ gridArea: "right", borderLeft: line, overflow: "auto" }}>{right}</div>
      ) : (
        <div style={{ display: "none" }} />
      )}
    </div>
  );
}
