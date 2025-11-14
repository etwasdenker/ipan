import React, { useMemo, useState, useEffect } from "react";
import { useUISettings } from "../state/uiSettings";

type MenuItem = { key: string; label: string; icon?: string; children?: MenuItem[] };

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleTheme?: () => void;
  headerHeight: number;
  onNavigate?: (key: string) => void;
  currentPath?: string; // ← добавили: для подсветки активного из router
};

const COLOR_ACTIVE = "#E5E5E5";
const COLOR_MUTED = "#696969";
const ICON_COL = 50;

const MENU: MenuItem[] = [
  { key: "panel", label: "ПАНЕЛЬ", icon: "/brand/base_online.svg" },
  {
    key: "structure", label: "СТРУКТУРА", icon: "/brand/folder.svg",
    children: [
      { key: "structure/users", label: "ПОЛЬЗОВАТЕЛИ", icon: "/brand/folder.svg" },
      { key: "structure/contacts", label: "КОНТАКТЫ", icon: "/brand/folder.svg" },
      { key: "structure/counterparties", label: "КОНТРАГЕНТЫ", icon: "/brand/folder.svg" },
      { key: "structure/brands", label: "БРЕНДЫ", icon: "/brand/folder.svg" },
      { key: "structure/stocks", label: "СКЛАДЫ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "content", label: "КОНТЕНТ", icon: "/brand/folder.svg",
    children: [
      { key: "content/products", label: "ПРОДУКЦИЯ", icon: "/brand/folder.svg" },
      { key: "content/articles", label: "СТАТЬИ", icon: "/brand/folder.svg" },
      { key: "content/sites", label: "САЙТЫ", icon: "/brand/folder.svg" },
      { key: "content/mailing", label: "РАССЫЛКИ", icon: "/brand/folder.svg" },
      { key: "content/offers", label: "АКЦИИ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "process", label: "ПРОЦЕССЫ", icon: "/brand/folder.svg",
    children: [
      { key: "process/orders", label: "ЗАЯВКИ", icon: "/brand/folder.svg" },
      { key: "process/proposals", label: "ПРЕДЛОЖЕНИЯ", icon: "/brand/folder.svg" },
      { key: "process/invoices", label: "СЧЕТА", icon: "/brand/folder.svg" },
      { key: "process/contracts", label: "ДОГОВОРЫ", icon: "/brand/folder.svg" },
      { key: "process/mailing", label: "РАССЫЛКА", icon: "/brand/folder.svg" },
      { key: "process/parsing", label: "ПАРСИНГ", icon: "/brand/folder.svg" },
      { key: "process/flows", label: "ПРОЦЕССЫ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "docs", label: "ДОКУМЕНТЫ", icon: "/brand/folder.svg",
    children: [
      { key: "docs/letters", label: "ПИСЬМА", icon: "/brand/folder.svg" },
      { key: "docs/incoming", label: "ВХОДЯЩИЕ СЧЕТА", icon: "/brand/folder.svg" },
      { key: "docs/receipts", label: "ПОСТУПЛЕНИЯ", icon: "/brand/folder.svg" },
      { key: "docs/sales", label: "РЕАЛИЗАЦИИ", icon: "/brand/folder.svg" },
      { key: "docs/shipments", label: "ОТГРУЗКИ", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "tools", label: "ИНСТРУМЕНТЫ", icon: "/brand/folder.svg",
    children: [
      { key: "tools/lex", label: "LEX", icon: "/brand/folder.svg" },
      { key: "tools/api", label: "API", icon: "/brand/folder.svg" },
    ],
  },
  {
    key: "settings", label: "НАСТРОЙКИ", icon: "/brand/options.svg",
    children: [
      { key: "settings/interface", label: "ИНТЕРФЕЙС", icon: "/brand/options.svg" },
      { key: "settings/templates", label: "ШАБЛОНЫ", icon: "/brand/folder.svg" },
      { key: "settings/rights", label: "ПРАВА", icon: "/brand/folder.svg" },
    ],
  },
];

const LeftSidebar: React.FC<Props> = ({
  collapsed, onToggleCollapsed, onToggleTheme, headerHeight, onNavigate, currentPath,
}) => {
  const {
    childIndentPx, groupFontWeight, childFontWeight,
    leftSidebarBg, sidebarWidthOpen, sidebarWidthCollapsed,
    showSidebarSeparator, lineColor,
  } = useUISettings();

  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const [activeKey, setActiveKey] = useState<string>("");

  // синхронизация активного пункта с адресной строкой
  useEffect(() => {
    if (!currentPath) return;
    // currentPath вида "settings/interface" или "process/orders"
    setActiveKey(currentPath);
    // автоматически раскрываем нужную группу
    const top = currentPath.split("/")[0];
    if (top) {
      setOpenKeys((prev) => {
        const next = new Set(prev);
        next.add(top);
        return next;
      });
    }
  }, [currentPath]);

  const width = useMemo(
    () => (collapsed ? sidebarWidthCollapsed : sidebarWidthOpen),
    [collapsed, sidebarWidthCollapsed, sidebarWidthOpen]
  );

  const txtBase: React.CSSProperties = {
    fontFamily: "'Amatic SC', cursive",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontSize: 24,
    margin: 0,
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "clip",
    lineHeight: 1.25,
  };

  const iconColor = (active: boolean) =>
    active ? "none"
           : "invert(49%) sepia(0%) saturate(0%) hue-rotate(175deg) brightness(90%) contrast(90%)";

  const handleGroupClick = (key: string) => {
    const next = new Set(openKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    setOpenKeys(next);
  };
  const handleItemClick = (key: string) => {
    setActiveKey(key);
    onNavigate?.(key);
  };

  return (
    <aside
      style={{
        position: "fixed",
        inset: 0,
        right: undefined,
        width,
        background: leftSidebarBg,
        borderRight: showSidebarSeparator ? `1px solid ${lineColor}` : "none",
        zIndex: 900,
        transition: "width 150ms ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Логотипы */}
      <div
        style={{
          height: headerHeight,
          display: "flex",
          alignItems: "center",
          paddingLeft: 10,
          gap: 8,
        }}
      >
        <img
          src="/brand/logo_ipan.svg" alt="iPan"
          width={28} height={28}
          style={{ cursor: "pointer" }}
          onClick={onToggleCollapsed}
          title={collapsed ? "Развернуть меню" : "Свернуть меню"}
        />
        {!collapsed && <img src="/brand/logo_ipan_word.svg" alt="iPan Word" style={{ height: 20 }} />}
      </div>

      {/* Навигация */}
      <nav aria-label="Основное меню" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {MENU.map((g) => {
          const groupOpen = openKeys.has(g.key);

          const GroupRow = (
            <div
              key={g.key}
              role="button" title={g.label}
              onClick={() => handleGroupClick(g.key)}
              style={{
                display: "grid",
                gridTemplateColumns: `${ICON_COL}px ${collapsed ? "0" : "1fr"}`,
                alignItems: "center",
                minHeight: 50,
                paddingRight: 10,
                cursor: "pointer",
                color: COLOR_MUTED,
                position: "relative",
              }}
            >
              <div style={{ width: ICON_COL, height: 50, display: "grid", placeItems: "center" }}>
                <img
                  src={g.icon || "/brand/folder.svg"} alt="" width={24} height={24}
                  style={{ filter: iconColor(false) }}
                />
              </div>

              {!collapsed && (
                <h4
                  style={{
                    ...txtBase,
                    fontWeight: groupFontWeight,
                    color: COLOR_MUTED,
                    paddingBlock: 6,
                  }}
                >
                  {g.label}
                </h4>
              )}
            </div>
          );

          const Children =
            g.children && groupOpen
              ? g.children.map((it) => {
                  const isActive = activeKey === it.key;
                  const color = isActive ? COLOR_ACTIVE : COLOR_MUTED;

                  return (
                    <div
                      key={it.key}
                      role="button" title={it.label}
                      onClick={() => handleItemClick(it.key)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: `${ICON_COL}px ${collapsed ? "0" : "1fr"}`,
                        alignItems: "center",
                        minHeight: 50,
                        paddingRight: 10,
                        cursor: "pointer",
                        position: "relative",
                        color,
                        marginLeft: collapsed ? 0 : childIndentPx,
                      }}
                    >
                      <div style={{ width: ICON_COL, height: 50, display: "grid", placeItems: "center" }}>
                        <img
                          src={it.icon || "/brand/folder.svg"} alt="" width={22} height={22}
                          style={{ filter: iconColor(isActive) }}
                        />
                      </div>

                      {!collapsed && (
                        <div style={{ paddingBlock: 6 }}>
                          <span style={{ ...txtBase, fontWeight: childFontWeight, color }}>{it.label}</span>
                        </div>
                      )}

                      {!collapsed && isActive && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            right: 0, top: 6, bottom: 6,
                            width: 4, borderRadius: 2, background: COLOR_ACTIVE,
                          }}
                        />
                      )}
                    </div>
                  );
                })
              : null;

          return (
            <div key={`${g.key}-wrap`}>
              {GroupRow}
              {Children}
            </div>
          );
        })}
      </nav>

      {/* Низ */}
      <div
        style={{
          height: 56,
          display: "grid",
          gridTemplateColumns: `${ICON_COL}px 1fr`,
          alignItems: "center",
          paddingRight: 12,
          borderTop: showSidebarSeparator ? `1px solid ${lineColor}` : "none",
        }}
      >
        <div style={{ width: ICON_COL, height: 56, display: "grid", placeItems: "center" }}>
          <button
            onClick={onToggleTheme}
            title="Сменить тему"
            style={{
              width: 34, height: 34, borderRadius: 10,
              border: showSidebarSeparator ? `1px solid ${lineColor}` : "1px solid transparent",
              background: "transparent", color: COLOR_ACTIVE,
              fontSize: 18, cursor: "pointer",
            }}
          >
            ☼
          </button>
        </div>
        {!collapsed && (
          <div style={{ textAlign: "right", color: COLOR_MUTED, fontFamily: "'Playpen Sans', system-ui, sans-serif" }}>
            V1.0
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
