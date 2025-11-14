import * as React from "react";
import { Box } from "@mui/material";

export type CarcassConfig = {
  version?: string;
  ui: {
    headerHeight: number;
    leftWidth: number;
    leftCollapsedWidth: number;
    rightWidth: number;
    gap: number;
    lineWidth: number;
    lineColor: string;
    fontHref?: string;
    fontFamily?: string;
  };
  state?: {
    leftCollapsed?: boolean;
  };
};

export type SlotRenderers = {
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  left?: React.ReactNode;
  main?: React.ReactNode;
  right?: React.ReactNode;
};

export default function MainCarcassShell(props: { config: CarcassConfig; slots?: SlotRenderers }) {
  const { ui } = props.config;
  const collapsed = !!props.config.state?.leftCollapsed;
  const leftW = collapsed ? ui.leftCollapsedWidth : ui.leftWidth;
  const rightW = ui.rightWidth;

  React.useEffect(() => {
    if (!ui.fontHref) return;
    const id = "main-carcass-font";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = ui.fontHref;
    document.head.appendChild(link);
  }, [ui.fontHref]);

  const line = `${ui.lineWidth}px solid ${ui.lineColor}`;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "var(--wb-app-bg)",
        color: "var(--wb-app-text)",
        fontFamily: ui.fontFamily || "inherit",
        display: "grid",
        gridTemplateRows: `${ui.headerHeight}px 1fr`,
        gridTemplateColumns: `${leftW}px 1fr ${rightW || 0}px`,
        gap: `${ui.gap}px`,
      }}
    >
      {/* HEADER */}
      <Box sx={{
        gridRow: "1 / 2",
        gridColumn: "1 / 4",
        borderBottom: line,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        px: 2
      }}>
        <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
          {props.slots?.headerLeft ?? <span style={{ opacity:.6 }}>header.left</span>}
        </Box>
        <Box sx={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:1 }}>
          {props.slots?.headerRight ?? <span style={{ opacity:.6 }}>header.right</span>}
        </Box>
      </Box>

      {/* LEFT */}
      <Box sx={{
        gridRow: "2 / 3",
        gridColumn: "1 / 2",
        borderRight: line,
        height: "100%",
        overflow: "hidden",
        position: "relative",
        p: 1
      }}>
        {props.slots?.left ?? <span style={{ opacity:.6 }}>left</span>}
      </Box>

      {/* MAIN */}
      <Box sx={{
        gridRow: "2 / 3",
        gridColumn: "2 / 3",
        height: "100%",
        overflow: "auto",
        position: "relative",
        p: 2
      }}>
        {props.slots?.main ?? <span style={{ opacity:.6 }}>main</span>}
      </Box>

      {/* RIGHT (опционально) */}
      {rightW > 0 && (
        <Box sx={{
          gridRow: "2 / 3",
          gridColumn: "3 / 4",
          borderLeft: line,
          height: "100%",
          overflow: "hidden",
          position: "relative",
          p: 1
        }}>
          {props.slots?.right ?? <span style={{ opacity:.6 }}>right</span>}
        </Box>
      )}
    </Box>
  );
}
