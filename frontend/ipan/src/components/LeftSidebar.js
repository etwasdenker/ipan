"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var uiSettings_1 = require("../state/uiSettings");
var COLOR_ACTIVE = "#E5E5E5";
var COLOR_MUTED = "#696969";
var ICON_COL = 50;
var MENU = [
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
var LeftSidebar = function (_a) {
    var collapsed = _a.collapsed, onToggleCollapsed = _a.onToggleCollapsed, onToggleTheme = _a.onToggleTheme, headerHeight = _a.headerHeight, onNavigate = _a.onNavigate, currentPath = _a.currentPath;
    var _b = (0, uiSettings_1.useUISettings)(), childIndentPx = _b.childIndentPx, groupFontWeight = _b.groupFontWeight, childFontWeight = _b.childFontWeight, leftSidebarBg = _b.leftSidebarBg, sidebarWidthOpen = _b.sidebarWidthOpen, sidebarWidthCollapsed = _b.sidebarWidthCollapsed, showSidebarSeparator = _b.showSidebarSeparator, lineColor = _b.lineColor;
    var _c = (0, react_1.useState)(function () { return new Set(); }), openKeys = _c[0], setOpenKeys = _c[1];
    var _d = (0, react_1.useState)(""), activeKey = _d[0], setActiveKey = _d[1];
    // синхронизация активного пункта с адресной строкой
    (0, react_1.useEffect)(function () {
        if (!currentPath)
            return;
        // currentPath вида "settings/interface" или "process/orders"
        setActiveKey(currentPath);
        // автоматически раскрываем нужную группу
        var top = currentPath.split("/")[0];
        if (top) {
            setOpenKeys(function (prev) {
                var next = new Set(prev);
                next.add(top);
                return next;
            });
        }
    }, [currentPath]);
    var width = (0, react_1.useMemo)(function () { return (collapsed ? sidebarWidthCollapsed : sidebarWidthOpen); }, [collapsed, sidebarWidthCollapsed, sidebarWidthOpen]);
    var txtBase = {
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
    var iconColor = function (active) {
        return active ? "none"
            : "invert(49%) sepia(0%) saturate(0%) hue-rotate(175deg) brightness(90%) contrast(90%)";
    };
    var handleGroupClick = function (key) {
        var next = new Set(openKeys);
        next.has(key) ? next.delete(key) : next.add(key);
        setOpenKeys(next);
    };
    var handleItemClick = function (key) {
        setActiveKey(key);
        onNavigate === null || onNavigate === void 0 ? void 0 : onNavigate(key);
    };
    return (<aside style={{
            position: "fixed",
            inset: 0,
            right: undefined,
            width: width,
            background: leftSidebarBg,
            borderRight: showSidebarSeparator ? "1px solid ".concat(lineColor) : "none",
            zIndex: 900,
            transition: "width 150ms ease",
            display: "flex",
            flexDirection: "column",
        }}>
      {/* Логотипы */}
      <div style={{
            height: headerHeight,
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
            gap: 8,
        }}>
        <img src="/brand/logo_ipan.svg" alt="iPan" width={28} height={28} style={{ cursor: "pointer" }} onClick={onToggleCollapsed} title={collapsed ? "Развернуть меню" : "Свернуть меню"}/>
        {!collapsed && <img src="/brand/logo_ipan_word.svg" alt="iPan Word" style={{ height: 20 }}/>}
      </div>

      {/* Навигация */}
      <nav aria-label="Основное меню" style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {MENU.map(function (g) {
            var groupOpen = openKeys.has(g.key);
            var GroupRow = (<div key={g.key} role="button" title={g.label} onClick={function () { return handleGroupClick(g.key); }} style={{
                    display: "grid",
                    gridTemplateColumns: "".concat(ICON_COL, "px ").concat(collapsed ? "0" : "1fr"),
                    alignItems: "center",
                    minHeight: 50,
                    paddingRight: 10,
                    cursor: "pointer",
                    color: COLOR_MUTED,
                    position: "relative",
                }}>
              <div style={{ width: ICON_COL, height: 50, display: "grid", placeItems: "center" }}>
                <img src={g.icon || "/brand/folder.svg"} alt="" width={24} height={24} style={{ filter: iconColor(false) }}/>
              </div>

              {!collapsed && (<h4 style={__assign(__assign({}, txtBase), { fontWeight: groupFontWeight, color: COLOR_MUTED, paddingBlock: 6 })}>
                  {g.label}
                </h4>)}
            </div>);
            var Children = g.children && groupOpen
                ? g.children.map(function (it) {
                    var isActive = activeKey === it.key;
                    var color = isActive ? COLOR_ACTIVE : COLOR_MUTED;
                    return (<div key={it.key} role="button" title={it.label} onClick={function () { return handleItemClick(it.key); }} style={{
                            display: "grid",
                            gridTemplateColumns: "".concat(ICON_COL, "px ").concat(collapsed ? "0" : "1fr"),
                            alignItems: "center",
                            minHeight: 50,
                            paddingRight: 10,
                            cursor: "pointer",
                            position: "relative",
                            color: color,
                            marginLeft: collapsed ? 0 : childIndentPx,
                        }}>
                      <div style={{ width: ICON_COL, height: 50, display: "grid", placeItems: "center" }}>
                        <img src={it.icon || "/brand/folder.svg"} alt="" width={22} height={22} style={{ filter: iconColor(isActive) }}/>
                      </div>

                      {!collapsed && (<div style={{ paddingBlock: 6 }}>
                          <span style={__assign(__assign({}, txtBase), { fontWeight: childFontWeight, color: color })}>{it.label}</span>
                        </div>)}

                      {!collapsed && isActive && (<span aria-hidden style={{
                                position: "absolute",
                                right: 0, top: 6, bottom: 6,
                                width: 4, borderRadius: 2, background: COLOR_ACTIVE,
                            }}/>)}
                    </div>);
                })
                : null;
            return (<div key={"".concat(g.key, "-wrap")}>
              {GroupRow}
              {Children}
            </div>);
        })}
      </nav>

      {/* Низ */}
      <div style={{
            height: 56,
            display: "grid",
            gridTemplateColumns: "".concat(ICON_COL, "px 1fr"),
            alignItems: "center",
            paddingRight: 12,
            borderTop: showSidebarSeparator ? "1px solid ".concat(lineColor) : "none",
        }}>
        <div style={{ width: ICON_COL, height: 56, display: "grid", placeItems: "center" }}>
          <button onClick={onToggleTheme} title="Сменить тему" style={{
            width: 34, height: 34, borderRadius: 10,
            border: showSidebarSeparator ? "1px solid ".concat(lineColor) : "1px solid transparent",
            background: "transparent", color: COLOR_ACTIVE,
            fontSize: 18, cursor: "pointer",
        }}>
            ☼
          </button>
        </div>
        {!collapsed && (<div style={{ textAlign: "right", color: COLOR_MUTED, fontFamily: "'Playpen Sans', system-ui, sans-serif" }}>
            V1.0
          </div>)}
      </div>
    </aside>);
};
exports.default = LeftSidebar;
