import * as React from "react";
import { Box } from "@mui/material";
import MenuWidget from "./MenuWidget";
import cfgUrl from "./config/main_menu.config.json?url";

export default function MenuPlay() {
  const [config, setConfig] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(cfgUrl, { cache: "no-store" });
        const json = await res.json();
        setConfig(json);
      } catch (e: any) {
        setError(`main_menu — ошибка конфига: ${e?.message || e}`);
      }
    })();
  }, []);

  if (error) {
    return (
      <Box sx={{ position:"fixed", inset:0, display:"grid", placeItems:"center", color:"var(--wb-app-text)" }}>
        {error}
      </Box>
    );
  }

  if (!config) {
    return (
      <Box sx={{ position:"fixed", inset:0, display:"grid", placeItems:"center", color:"var(--wb-app-text)" }}>
        Загрузка main_menu…
      </Box>
    );
  }

  return (
    <MenuWidget
      config={config}
      preview={{ collapsed: false }}
      activeKey={null}
      onSelect={() => {}}
      resolveIconUrl={() => "/brand/folder.svg"}
    />
  );
}
