import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

export const DevProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<"dark" | "light">(() => {
    try { return (localStorage.getItem("wb.theme") as any) || "dark"; } catch { return "dark"; }
  });

  useEffect(() => {
    const onSet = (e: Event) => {
      const ev = e as CustomEvent;
      const next = ev.detail === "light" ? "light" : "dark";
      setMode(next);
      try { localStorage.setItem("wb.theme", next); } catch {}
    };
    window.addEventListener("wb:theme:set", onSet as EventListener);
    return () => window.removeEventListener("wb:theme:set", onSet as EventListener);
  }, []);

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      background: { default: mode === "dark" ? "#0f0f0f" : "#fafafa", paper: "transparent" },
      divider: mode === "dark" ? "#3c3c3c" : "#cfcfcf",
      text: { primary: mode === "dark" ? "#eee" : "#111" },
    },
    typography: {
      // НЕ навязываем шрифт виджетам — пусть наследуют свой
      fontFamily: 'inherit',
    },
    components: {
      MuiListItemButton: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiListItemIcon:   { styleOverrides: { root: { minWidth: 20 } } },
    }
  }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default DevProviders;
