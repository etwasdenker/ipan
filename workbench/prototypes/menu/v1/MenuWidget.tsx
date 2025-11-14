import * as React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";

export type ModuleItem = { key: string; title: string; path?: string; offset?: number; };
export type Group = { key: string; title: string; offset?: number; modules: ModuleItem[]; };
export type MenuConfig = {
  version?: string;
  ui?: {
    expandedWidth?: number; collapsedWidth?: number;
    indent?: number; groupSpacing?: number;

    itemFontSize?: number; groupFontSize?: number;
    itemWeight?: number; activeWeight?: number; groupWeight?: number;

    hoverBgItem?: string; hoverBgGroup?: string;

    activeBarWidth?: number; activeBarColor?: string;

    iconSizeItem?: number; iconSizeGroup?: number;

    fontFamily?: string;

    baseBg?: string;
    itemBg?: string;
    groupBg?: string;

    itemTextColor?: string;   // "auto" | CSS
    groupTextColor?: string;  // "auto-muted" | CSS
    activeTextColor?: string; // "auto" | CSS
  };
  groups: Group[];
};

export type MenuWidgetProps = {
  config: MenuConfig;
  preview?: { collapsed?: boolean };
  activeKey?: string | null;
  onSelect?: (key: string) => void;
  resolveIconUrl?: (name: string, kind: "group" | "item") => string;
};

const FALLBACK_ICON = "/brand/folder.svg";

// «авто»-палитра из темы
function resolveColor(val: string | undefined, fallbackVar: string): string {
  if (!val || val === "auto") return `var(--wb-app-text)`;
  if (val === "auto-muted") return `var(--wb-app-muted)`;
  if (val === "auto-hover") return `var(--wb-app-hover)`;
  if (val === "auto-bar")   return `var(--wb-menu-activebar)`;
  return val ?? `var(${fallbackVar})`;
}

// Тонированная иконка из SVG через mask (цвет = currentColor)
function TintedIcon({ url, size, color }: { url: string; size: number; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: color,                 // ← цвет иконки = цвет текста
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export default function MenuWidget(props: MenuWidgetProps) {
  const cfg = props.config || { groups: [] };
  const ui = cfg.ui || {};
  const previewCollapsed = !!props.preview?.collapsed;

  const expandedWidth   = ui.expandedWidth  ?? 260;
  const collapsedWidth  = ui.collapsedWidth ?? 72;
  const nestedIndent    = ui.indent ?? 12;
  const groupSpacing    = ui.groupSpacing ?? 10;

  const itemFontSize    = ui.itemFontSize  ?? 13;
  const groupFontSize   = ui.groupFontSize ?? 12;
  const itemWeight      = ui.itemWeight    ?? 400;
  const activeWeight    = ui.activeWeight  ?? 700;
  const groupWeight     = ui.groupWeight   ?? 700;

  const hoverBgItem     = resolveColor(ui.hoverBgItem, "--wb-app-hover");
  const hoverBgGroup    = resolveColor(ui.hoverBgGroup, "--wb-app-hover");
  const activeBarWidth  = ui.activeBarWidth ?? 2;
  const activeBarColor  = resolveColor(ui.activeBarColor, "--wb-menu-activebar");

  const iconSizeItem    = ui.iconSizeItem  ?? Math.max(14, Math.round(itemFontSize));
  const iconSizeGroup   = ui.iconSizeGroup ?? Math.max(14, Math.round(groupFontSize));
  const fontFamily      = ui.fontFamily     ?? "inherit";

  const baseBg          = ui.baseBg         ?? "var(--wb-app-bg, transparent)";
  const itemBg          = ui.itemBg         ?? "transparent";
  const groupBg         = ui.groupBg        ?? "transparent";
  const itemTextColor   = resolveColor(ui.itemTextColor, "--wb-app-text");
  const groupTextColor  = resolveColor(ui.groupTextColor, "--wb-app-muted");
  const activeTextColor = resolveColor(ui.activeTextColor, "--wb-app-text");

  const width = previewCollapsed ? collapsedWidth : expandedWidth;

  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    const init: Record<string, boolean> = {};
    (cfg.groups || []).forEach(g => init[g.key] = true); // старт: группы свернуты
    setCollapsedGroups(init);
  }, [cfg]);

  const activeKey = props.activeKey ?? null;
  const setActive = (k: string) => props.onSelect?.(k);
  const iconUrl = (kind: "group" | "item") => props.resolveIconUrl?.("folder", kind) || FALLBACK_ICON;

  return (
    <Box
      sx={{
        position: "fixed", inset: 0, display: "grid",
        gridTemplateColumns: `${width}px 1fr`,
        height: "100vh", overflow: "hidden",
        bgcolor: baseBg,
        color: "var(--wb-app-text)",
        fontFamily,
      }}
    >
      <Box sx={{ position: "relative", width, height: "100%", overflow: "hidden" }}>
        <List disablePadding sx={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden", p: "6px 8px" }}>
          {(cfg.groups || []).map((g, gi) => {
            const isCollapsed = !!collapsedGroups[g.key];

            // цвет иконки/текста для группы
            const groupColor = groupTextColor;

            const GroupRow = (
              <ListItemButton
                disableRipple
                onClick={() => setCollapsedGroups(s => ({ ...s, [g.key]: !s[g.key] }))}
                title={isCollapsed ? "Развернуть" : "Свернуть"}
                sx={{
                  gap: 1, py: 0.75,
                  textTransform: "uppercase", letterSpacing: 0.6,
                  fontSize: groupFontSize,
                  bgcolor: groupBg,
                  color: groupColor,
                  "&:hover": { bgcolor: hoverBgGroup },
                }}
              >
                <ListItemIcon sx={{ minWidth: 20 }}>
                  <TintedIcon url={iconUrl("group")} size={iconSizeGroup} color={groupColor} />
                </ListItemIcon>
                {!previewCollapsed && (
                  <ListItemText
                    primary={g.title}
                    primaryTypographyProps={{
                      fontWeight: groupWeight,
                      fontSize: groupFontSize,
                      lineHeight: 1,
                      sx: { color: groupColor, fontFamily },
                    }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <Box key={g.key} sx={{ mt: gi === 0 ? 0 : (g.offset ?? groupSpacing) }}>
                {previewCollapsed ? <Tooltip title={g.title} placement="right"><Box>{GroupRow}</Box></Tooltip> : GroupRow}

                {!isCollapsed && (
                  <Box>
                    {g.modules.map((m) => {
                      const isActive = activeKey === m.key;

                      // цвет иконки/текста для пункта
                      const itemColor = isActive ? activeTextColor : itemTextColor;

                      const ItemRow = (
                        <ListItemButton
                          key={m.key}
                          disableRipple
                          onClick={() => setActive(m.key)}
                          title={m.title}
                          sx={{
                            position: "relative",
                            gap: 1, py: 0.75,
                            pl: previewCollapsed ? "8px" : `${12 + nestedIndent}px`,
                            ...(m.offset ? { mt: `${m.offset}px` } : {}),
                            bgcolor: itemBg,
                            color: itemColor,
                            "&:hover": { bgcolor: hoverBgItem },
                            "&::after": isActive ? {
                              content: '""', position: "absolute", right: 0, top: 0, bottom: 0,
                              width: `${activeBarWidth}px`, backgroundColor: activeBarColor,
                            } : {},
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 20 }}>
                            <TintedIcon url={iconUrl("item")} size={iconSizeItem} color={itemColor} />
                          </ListItemIcon>

                          {!previewCollapsed && (
                            <ListItemText
                              primary={m.title}
                              primaryTypographyProps={{
                                fontSize: itemFontSize,
                                fontWeight: isActive ? activeWeight : itemWeight,
                                sx: { color: itemColor, fontFamily },
                              }}
                            />
                          )}
                        </ListItemButton>
                      );

                      return previewCollapsed
                        ? <Tooltip key={m.key} title={m.title} placement="right"><Box>{ItemRow}</Box></Tooltip>
                        : <Box key={m.key}>{ItemRow}</Box>;
                    })}
                  </Box>
                )}
              </Box>
            );
          })}
        </List>
      </Box>
      <Box />
    </Box>
  );
}
