import * as React from "react";
import { Box } from "@mui/material";
import MainCarcassShell, { type CarcassConfig } from "./MainCarcassShell";
import cfgUrl from "./config/main_carcass.config.json?url";

export default function CarcassPlay() {
  const [cfg, setCfg] = React.useState<CarcassConfig | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(cfgUrl, { cache: "no-store" });
        const json = await res.json();
        setCfg(json);
      } catch (e: any) {
        setErr(`main_carcass — ошибка конфига: ${e?.message || e}`);
      }
    })();
  }, []);

  if (err) {
    return <Box sx={{ position:"fixed", inset:0, display:"grid", placeItems:"center", color:"var(--wb-app-text)" }}>{err}</Box>;
  }
  if (!cfg) {
    return <Box sx={{ position:"fixed", inset:0, display:"grid", placeItems:"center", color:"var(--wb-app-text)" }}>Загрузка main_carcass…</Box>;
  }

  return (
    <MainCarcassShell
      config={cfg}
      slots={{
        headerLeft:  <span style={{ opacity:.6 }}>logo / back / refresh</span>,
        headerRight: <span style={{ opacity:.6 }}>user · db · date/time</span>,
        left:        <span style={{ opacity:.6 }}>← сюда позже встанет main_menu</span>,
        main:        <span style={{ opacity:.6 }}>рабочая область</span>,
        right:       <span style={{ opacity:.6 }}>правая колонка (опционально)</span>,
      }}
    />
  );
}
