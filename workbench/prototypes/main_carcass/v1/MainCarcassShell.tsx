import * as React from "react";
import { Box } from "@mui/material";
import { createPortal } from "react-dom";

/** Конфиг каркаса */
export type CarcassAreasConfig = {
  theme?: string | { mode: "dark" | "light" };
  tokens?: {
    bg?: Record<string, string>;
    line?: { defaultColor?: string; hoverColor?: string };
  };
  areas: Record<
    string,
    {
      present?: boolean;
      bg?: string;
      bgRef?: string;
      scroll?: "none" | "y" | "x" | "both";
      size?: { width?: string | number; height?: string | number; min?: number; std?: number };
      line?: { side: "left" | "right" | "top" | "bottom"; color?: string; thickness?: number };
      resizable?: {
        enabled: boolean;
        axis: "x" | "y";
        edge: "left" | "right" | "top" | "bottom";
        collapseTo?: "left" | "right" | "top" | "bottom";
        min?: number;
        max?: number;
        snap?: number;
        lsKey?: string;
        /** z-index ручки в фиксированном режиме (когда область схлопнута) */
        overlayZ?: number;
      };
      minContentWidth?: number;
    }
  >;
};

export type Slots = Record<string, React.ReactNode>;

function px(v: string | number | undefined, fallback: string): string {
  if (v == null) return fallback;
  if (typeof v === "number") return `${v}px`;
  const s = String(v).trim();
  if (s.endsWith("px")) return s;
  const n = parseFloat(s);
  return Number.isFinite(n) ? `${n}px` : fallback;
}
function num(v: string | number | undefined, fallback: number): number {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : fallback;
}
function mode(theme: CarcassAreasConfig["theme"]) {
  if (!theme) return "dark";
  return typeof theme === "string" ? theme : theme.mode;
}
function area(cfg: CarcassAreasConfig, key: string) {
  return cfg.areas?.[key] || {};
}
function areaBg(a: any, cfg: CarcassAreasConfig, fallback: string) {
  if (a?.bg) return a.bg;
  if (a?.bgRef && cfg.tokens?.bg?.[a.bgRef]) return cfg.tokens!.bg![a.bgRef]!;
  return fallback;
}
function borderStyle(a: any, defColor?: string) {
  if (!a?.line?.side || a?.present === false) return {};
  const w = px(a.line.thickness ?? 1, "1px");
  const c = a.line.color ?? defColor ?? "rgba(138,138,138,.9)";
  const side = a.line.side;
  return {
    [side === "left" ? "borderLeft" : side === "right" ? "borderRight" : side === "top" ? "borderTop" : "borderBottom"]:
      `${w} solid ${c}`,
  };
}
function scrollCss(a: any, def: "none" | "y" | "x" | "both" = "none") {
  const v: "none" | "y" | "x" | "both" = a?.scroll ?? def;
  switch (v) {
    case "y":
      return { overflowX: "hidden", overflowY: "auto" as const };
    case "x":
      return { overflowX: "auto" as const, overflowY: "hidden" };
    case "both":
      return { overflowX: "auto" as const, overflowY: "auto" as const };
    default:
      return { overflowX: "hidden", overflowY: "hidden" };
  }
}

/** LS helpers */
function readLS(key?: string): number | undefined {
  if (!key) return undefined;
  try {
    const v = localStorage.getItem(key);
    if (!v) return undefined;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  } catch {
    return undefined;
  }
}
function writeLS(key?: string, value?: number) {
  if (!key || value == null) return;
  try {
    localStorage.setItem(key, String(value));
  } catch {}
}
function clampSnap(v: number, min?: number, max?: number, snap?: number) {
  let x = v;
  if (typeof min === "number" && x < min) x = min;
  if (typeof max === "number" && x > max) x = max;
  if (snap && snap > 1) x = Math.round(x / snap) * snap;
  return x;
}

/** уровень UIC — для приоритета (3 > 2 > 1) */
function uicLevel(areaKey: string): number {
  const m = areaKey.match(/^(\d)/);
  const n = m ? parseInt(m[1], 10) : 1;
  return Number.isFinite(n) ? n : 1;
}

type CollapseSide = "left" | "right" | "top" | "bottom";

/** Ручка ресайза — без «сдвига», просто утолщение линии 2px → 4px по кромке */
function ResizeHandle(props: {
  areaKey: string;
  res: NonNullable<NonNullable<CarcassAreasConfig["areas"][string]>["resizable"]>;
  getSize: () => number;
  setSize: (n: number) => void;
  themeMode: "dark" | "light";
  overlayParentRef?: React.RefObject<HTMLElement>;
}) {
  const { areaKey, res, getSize, setSize, themeMode, overlayParentRef } = props;
  const isX = res.axis === "x";
  const edge = res.edge;
  const collapseTo: CollapseSide =
    res.collapseTo ?? (edge === "left" || edge === "right" ? edge : edge === "top" ? "top" : "bottom");

  const cursor = isX ? "col-resize" : "row-resize";
  const level = uicLevel(areaKey);
  const HI = themeMode === "dark" ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.9)";

  const zFor = (collapsed: boolean) =>
    100 + level * 10 + (collapsed ? 50 : 0) + (edge === "left" || edge === "top" ? 2 : 1);

  const dragRef = React.useRef<{ start: number; orig: number; moved: boolean } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const start = isX ? e.clientX : e.clientY;
    dragRef.current = { start, orig: getSize(), moved: false };

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = (isX ? ev.clientX : ev.clientY) - dragRef.current.start;
      dragRef.current.moved ||= Math.abs(delta) > 2;

      let next = dragRef.current.orig;
      if (isX) {
        next = edge === "right" ? dragRef.current.orig + delta : dragRef.current.orig - delta;
      } else {
        next = edge === "bottom" ? dragRef.current.orig + delta : dragRef.current.orig - delta;
      }
      next = clampSnap(next, res.min, res.max, res.snap);
      setSize(next);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (dragRef.current && !dragRef.current.moved) {
        const cur = getSize();
        const min = typeof res.min === "number" ? res.min : cur;
        const max = typeof res.max === "number" ? res.max : cur;
        setSize(cur > (min + max) / 2 ? min : max); // клик = тумблер
      }
      dragRef.current = null;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const collapsed = getSize() <= 1;

  const lineBase = (side: "left" | "right" | "top" | "bottom") => {
    const common: any = {
      content: '""',
      position: "absolute",
      backgroundColor: "transparent",
      transition: "width .12s linear, height .12s linear, background-color .12s linear",
      pointerEvents: "none",
    };
    if (isX) {
      common.top = 0;
      common.bottom = 0;
      common.width = 2;
      common[side] = 0;
    } else {
      common.left = 0;
      common.right = 0;
      common.height = 2;
      common[side] = 0;
    }
    return common;
  };

  const renderBar = (
    stylePos: React.CSSProperties,
    anchor: "left" | "right" | "top" | "bottom",
    z: number
  ) => (
    <Box
      onMouseDown={onMouseDown}
      sx={{
        ...stylePos,
        zIndex: z,
        cursor,
        position: (stylePos as any).position ?? "absolute", // важная правка: уважаем переданное position
        pointerEvents: "auto",
        ...(isX ? { width: 12, top: 0, bottom: 0 } : { height: 12, left: 0, right: 0 }),
        "&::after": lineBase(anchor),
        "&:hover::after": {
          ...(isX ? { width: 4 } : { height: 4 }),
          [anchor]: 0,
          backgroundColor: HI,
        },
      }}
    />
  );

  if (!collapsed) {
    const pos: any = {};
    if (isX) {
      pos[edge] = 0;
      pos.top = 0;
      pos.bottom = 0;
    } else {
      pos[edge] = 0;
      pos.left = 0;
      pos.right = 0;
    }
    return renderBar(pos, edge, zFor(false));
  }

  // === СХЛОПНУТА ОБЛАСТЬ ===
  // Для схлопнутой ручки делаем portal:
  // - если передан overlayParentRef и это не верхняя кромка, рендерим туда
  // - иначе (в т.ч. top-кромка) рендерим в document.body c position: fixed
  const preferBody =
    !overlayParentRef?.current || (res.axis === "y" && collapseTo === "top");
  const z = res.overlayZ ?? zFor(true);

  const pos: any = {};
  if (isX) {
    pos[collapseTo] = 0;
    pos.top = 0;
    pos.bottom = 0;
  } else {
    pos[collapseTo] = 0;
    pos.left = 0;
    pos.right = 0;
  }
  if (preferBody) pos.position = "fixed"; // фикс по вьюпорту, поверх всего

  const host = preferBody ? document.body : overlayParentRef!.current!;
  return createPortal(renderBar(pos, collapseTo, z), host);
}

export default function MainCarcassShell({
  cfg,
  slots,
}: {
  cfg: CarcassAreasConfig;
  slots?: Slots;
}) {
  const m = mode(cfg.theme);
  const defLineColor = cfg.tokens?.line?.defaultColor ?? "rgba(138,138,138,.9)";

  // areas
  const aLeft = area(cfg, "1left_uic");
  const aTop = area(cfg, "1top_uic");
  const aMain = area(cfg, "1main_uic");
  const aTabs = area(cfg, "2tabs_uic");
  const aMiddle = area(cfg, "2middle_uic");
  const aWindow = area(cfg, "2window_uic");
  const aRight = area(cfg, "2right_uic");
  const a2tleft = area(cfg, "2tleft_uic");
  const a2cleft = area(cfg, "2cleft_uic");
  const a2bleft = area(cfg, "2bleft_uic");
  const a2browse = area(cfg, "2browse_uic");
  const a2tray = area(cfg, "2tray_uic");
  const a3ltabs = area(cfg, "3ltabs_uic");
  const a3rtabs = area(cfg, "3rtabs_uic");
  const a3tcontent = area(cfg, "3tcontent_uic");
  const a3content = area(cfg, "3content_uic");
  const a3bcontent = area(cfg, "3bcontent_uic");
  const a3taux = area(cfg, "3taux_uic");
  const a3aux = area(cfg, "3aux_uic");
  const a3baux = area(cfg, "3baux_uic");
  const a3tmiddle = area(cfg, "3tmiddle_uic");
  const a3bmiddle = area(cfg, "3bmiddle_uic");

  /** overrides из LS */
  const [ov, setOv] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    const next: Record<string, number> = {};
    for (const [, a] of Object.entries(cfg.areas || {})) {
      const rs = a?.resizable;
      if (rs?.enabled && rs.lsKey) {
        const v = readLS(rs.lsKey);
        if (typeof v === "number") next[rs.lsKey] = v;
      }
    }
    setOv(next);
  }, [cfg]);

  const getDim = (aKey: string, a: any, dim: "width" | "height", fallbackNum: number) => {
    const rs = a?.resizable;
    const lsKey = rs?.lsKey;
    const v = lsKey ? ov[lsKey] : undefined;
    return typeof v === "number" ? v : num(a?.size?.[dim], fallbackNum);
  };
  const setDim = (a: any, value: number) => {
    const lsKey = a?.resizable?.lsKey;
    if (!lsKey) return;
    const v = clampSnap(value, a.resizable?.min, a.resizable?.max, a.resizable?.snap);
    setOv((s) => ({ ...s, [lsKey]: v }));
    writeLS(lsKey, v);
  };

  // размеры (с учётом overrides)
  const LEFT_W_NUM = getDim("1left_uic", aLeft, "width", 300);
  const TOP_H_NUM = getDim("1top_uic", aTop, "height", 60);
  const MID_LEFT_W_NUM = getDim("2middle_uic", aMiddle, "width", 280);
  const MID_RIGHT_W_NUM = getDim("2right_uic", aRight, "width", 260);
  const TABS_H_NUM = num(aTabs.size?.height, 56);
  const L_T_H_NUM = num(a2tleft.size?.height, 49);
  const L_B_H_NUM = num(a2bleft.size?.height, 52);
  const TRAY_W_NUM = num(a2tray.size?.width, 240);
  const RTABS_W_NUM = num(a3rtabs.size?.width, 200);
  const CT_TOP_H_NUM = getDim("3tcontent_uic", a3tcontent, "height", 64);
  const CT_BOT_H_NUM = getDim("3bcontent_uic", a3bcontent, "height", 56);
  const MID_TOP_H_NUM = getDim("3tmiddle_uic", a3tmiddle, "height", 180);
  const MID_BOT_H_NUM = num(a3bmiddle.size?.height, 0);

  const LEFT_W = `${LEFT_W_NUM}px`;
  const TOP_H = `${TOP_H_NUM}px`;
  const MID_RIGHT_W = `${MID_RIGHT_W_NUM}px`;
  const TABS_H = `${TABS_H_NUM}px`;
  const L_T_H = `${L_T_H_NUM}px`;
  const L_B_H = `${L_B_H_NUM}px`;
  const TRAY_W = `${TRAY_W_NUM}px`;
  const RTABS_W = `${RTABS_W_NUM}px`;
  const CT_TOP_H = `${CT_TOP_H_NUM}px`;
  const CT_BOT_H = `${CT_BOT_H_NUM || 0}px`;
  const MID_TOP_H = `${MID_TOP_H_NUM}px`;
  const MID_BOT_H = `${MID_BOT_H_NUM || 0}px`;

  // Эффективная ширина middle: 0, если область отключена (present:false)
  const MID_LEFT_W_EFF_NUM = aMiddle.present === false ? 0 : MID_LEFT_W_NUM;
  const MID_LEFT_W_EFF = `${MID_LEFT_W_EFF_NUM}px`;

  const baseBg = mode(cfg.theme) === "light" ? "#f4f4f6" : "#121212";

  const areaSx = (a: any, fallbackBg: string) => {
    const bg = areaBg(a, cfg, fallbackBg);
    return {
      "--area-bg": bg,
      ...scrollCss(a, "none"),
      bgcolor: bg,
      ...borderStyle(a, cfg.tokens?.line?.defaultColor),
      "&::-webkit-scrollbar-track": { backgroundColor: "var(--area-bg)" },
      "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,.35)" },
      scrollbarColor: "rgba(255,255,255,.35) var(--area-bg)",
    } as const;
  };

  // refs для оверлеев внутренних граней
  const mainGridRef = React.useRef<HTMLDivElement | null>(null);
  const midGridRef = React.useRef<HTMLDivElement | null>(null);
  const winGridRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Box
      data-uic="ipan_uic"
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: baseBg,
        color: mode(cfg.theme) === "light" ? "#1a1a1a" : "#ececec",
        display: "grid",
        gridTemplateColumns: `${LEFT_W} 1fr`,
        gridTemplateRows: `${TOP_H} 1fr`,
        gridTemplateAreas: `"left top" "left main"`,
      }}
    >
      {/* LEFT */}
      <Box data-uic="1left_uic" sx={{ gridArea: "left", position: "relative", ...areaSx(aLeft, "#191919") }}>
        {aLeft?.resizable?.enabled && (
          <ResizeHandle
            areaKey="1left_uic"
            res={aLeft.resizable}
            getSize={() => LEFT_W_NUM}
            setSize={(n) => setDim(aLeft, n)}
            themeMode={mode(cfg.theme) as "dark" | "light"}
          />
        )}
        <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateRows: `${L_T_H} 1fr ${L_B_H}` }}>
          <Box data-uic="2tleft_uic" sx={{ display: a2tleft.present === false ? "none" : "flex", ...areaSx(a2tleft, "#181818") }}>
            {slots?.["2tleft_uic"]}
          </Box>
          <Box data-uic="2cleft_uic" sx={{ display: a2cleft.present === false ? "none" : "block", ...areaSx(a2cleft, "#191919"), overflowY: "auto" }}>
            {slots?.["2cleft_uic"]}
          </Box>
          <Box data-uic="2bleft_uic" sx={{ display: a2bleft.present === false ? "none" : "flex", ...areaSx(a2bleft, "#181818") }}>
            {slots?.["2bleft_uic"]}
          </Box>
        </Box>
      </Box>

      {/* TOP */}
      <Box data-uic="1top_uic" sx={{ gridArea: "top", position: "relative", ...areaSx(aTop, "#1c1c1c") }}>
        {aTop?.resizable?.enabled && (
          <ResizeHandle
            areaKey="1top_uic"
            res={aTop.resizable}
            getSize={() => TOP_H_NUM}
            setSize={(n) => setDim(aTop, n)}
            themeMode={mode(cfg.theme) as "dark" | "light"}
          />
        )}
        <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `1fr ${TRAY_W}` }}>
          <Box data-uic="2browse_uic" sx={{ display: a2browse.present === false ? "none" : "flex", ...areaSx(a2browse, "#1b1b1b") }}>
            {slots?.["2browse_uic"]}
          </Box>
          <Box data-uic="2tray_uic" sx={{ display: a2tray.present === false ? "none" : "flex", ...areaSx(a2tray, "#1b1b1b") }}>
            {slots?.["2tray_uic"]}
          </Box>
        </Box>
      </Box>

      {/* MAIN */}
      <Box data-uic="1main_uic" sx={{ gridArea: "main", position: "relative", ...areaSx(aMain, "#171717") }}>
        <Box
          ref={mainGridRef}
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: `${MID_LEFT_W_EFF} 1fr ${MID_RIGHT_W}`,
            gridTemplateRows: `${TABS_H} 1fr`,
          }}
        >
          {/* TABS */}
          <Box data-uic="2tabs_uic" sx={{ gridColumn: "1 / 4", position: "relative", display: aTabs.present === false ? "none" : "flex", ...areaSx(aTabs, "#1b1b1b") }}>
            <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: `1fr ${RTABS_W}` }}>
              <Box data-uic="3ltabs_uic" sx={{ display: a3ltabs.present === false ? "none" : "flex", ...areaSx(a3ltabs, "#1b1b1b") }}>
                {slots?.["3ltabs_uic"]}
              </Box>
              <Box data-uic="3rtabs_uic" sx={{ display: a3rtabs.present === false ? "none" : "flex", ...areaSx(a3rtabs, "#1b1b1b") }}>
                {slots?.["3rtabs_uic"]}
              </Box>
            </Box>
          </Box>

          {/* LEFT (внутри main) */}
          <Box data-uic="2middle_uic" sx={{ display: aMiddle.present === false ? "none" : "flex", position: "relative", ...areaSx(aMiddle, "#181818") }}>
            {aMiddle.present !== false && aMiddle?.resizable?.enabled && (
              <ResizeHandle
                areaKey="2middle_uic"
                res={aMiddle.resizable}
                getSize={() => MID_LEFT_W_NUM}
                setSize={(n) => setDim(aMiddle, n)}
                themeMode={mode(cfg.theme) as "dark" | "light"}
                overlayParentRef={mainGridRef}
              />
            )}
            <Box ref={midGridRef} sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateRows: `${MID_TOP_H} 1fr ${MID_BOT_H}` }}>
              <Box data-uic="3tmiddle_uic" sx={{ ...areaSx(a3tmiddle, "#181818"), overflowY: "auto", position: "relative" }}>
                {a3tmiddle?.resizable?.enabled && (
                  <ResizeHandle
                    areaKey="3tmiddle_uic"
                    res={a3tmiddle.resizable}
                    getSize={() => MID_TOP_H_NUM}
                    setSize={(n) => setDim(a3tmiddle, n)}
                    themeMode={mode(cfg.theme) as "dark" | "light"}
                    overlayParentRef={midGridRef}
                  />
                )}
              </Box>
              <Box data-uic="3bmiddle_uic" sx={{ ...areaSx(a3bmiddle, "#181818"), overflowY: "auto" }} />
            </Box>
          </Box>

          {/* CONTENT */}
          <Box data-uic="2window_uic" sx={{ position: "relative", ...areaSx(aWindow, "#161616") }}>
            <Box ref={winGridRef} sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateRows: `${CT_TOP_H} 1fr ${CT_BOT_H}` }}>
              <Box data-uic="3tcontent_uic" sx={{ display: a3tcontent.present === false ? "none" : "flex", ...areaSx(a3tcontent, "#181818"), position: "relative" }} />
              <Box data-uic="3content_uic" sx={{ ...areaSx(a3content, "#161616"), overflow: "auto" }}>
                {slots?.["3content_uic"]}
              </Box>
              <Box data-uic="3bcontent_uic" sx={{ display: a3bcontent.present === false ? "none" : "flex", ...areaSx(a3bcontent, "#181818") }} />
            </Box>
          </Box>

          {/* RIGHT */}
          <Box data-uic="2right_uic" sx={{ display: aRight.present === false ? "none" : "flex", position: "relative", ...areaSx(aRight, "#181818") }}>
            {aRight?.resizable?.enabled && (
              <ResizeHandle
                areaKey="2right_uic"
                res={aRight.resizable}
                getSize={() => MID_RIGHT_W_NUM}
                setSize={(n) => setDim(aRight, n)}
                themeMode={mode(cfg.theme) as "dark" | "light"}
                overlayParentRef={mainGridRef}
              />
            )}
            <Box sx={{ position: "absolute", inset: 0, display: "grid", gridTemplateRows: `${num(a3taux.size?.height, 0)}px 1fr ${num(a3baux.size?.height, 0)}px` }}>
              <Box data-uic="3taux_uic" sx={{ display: a3taux.present === false ? "none" : "flex", ...areaSx(a3taux, "#181818") }} />
              <Box data-uic="3aux_uic" sx={{ ...areaSx(a3aux, "#181818"), overflowY: "auto" }} />
              <Box data-uic="3baux_uic" sx={{ display: a3baux.present === false ? "none" : "flex", ...areaSx(a3baux, "#181818") }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
