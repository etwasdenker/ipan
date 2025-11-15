import * as React from "react";
import MainCarcassShell, { CarcassAreasConfig } from "./MainCarcassShell";
import cfg from "./config/main_carcass.config.json";

const CONFIG = cfg as CarcassAreasConfig;

function useResetOnce() {
  React.useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("reset_mc") === "1") {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("mc."))
        .forEach((k) => localStorage.removeItem(k));
      url.searchParams.delete("reset_mc");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);
}

export default function MainCarcassPlay() {
  useResetOnce();

  // пример: включить/выключить 2middle_uic через query (?no_middle=1)
  const url = new URL(window.location.href);
  const noMiddle = url.searchParams.get("no_middle") === "1";
  const runtimeCfg: CarcassAreasConfig = React.useMemo(() => {
    const deep = JSON.parse(JSON.stringify(CONFIG)) as CarcassAreasConfig;
    if (noMiddle) {
      if (!deep.areas["2middle_uic"]) deep.areas["2middle_uic"] = {};
      deep.areas["2middle_uic"].present = false;
    }
    return deep;
  }, [noMiddle]);

  return <MainCarcassShell cfg={runtimeCfg} />;
}
