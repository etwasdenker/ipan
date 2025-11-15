"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
// frontend/ipan/src/components/Layout.tsx
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var HeaderBar_1 = require("./HeaderBar");
var LeftSidebar_1 = require("./LeftSidebar");
// helpers: берём настройки из localStorage с дефолтами
var getBool = function (k, d) {
    var _a;
    if (d === void 0) { d = true; }
    return ((_a = localStorage.getItem(k)) !== null && _a !== void 0 ? _a : (d ? "1" : "0")) === "1";
};
var getNum = function (k, d) {
    var n = Number(localStorage.getItem(k));
    return Number.isFinite(n) && n > 0 ? n : d;
};
var getStr = function (k, d) { return localStorage.getItem(k) || d; };
var READ = {
    sidebarOpen: function () { return getBool("ui.sidebar.open", true); },
    wOpen: function () { return getNum("ui.sidebar.w_open", 280); },
    wClosed: function () { return getNum("ui.sidebar.w_closed", 56); },
    headerH: function () { return getNum("ui.header.height", 80); },
    mainBg: function () { return getStr("ui.main.bg", "#141414"); },
};
function Layout() {
    // состояние ширин/высот и открытости
    var _a = (0, react_1.useState)(READ.sidebarOpen()), open = _a[0], setOpen = _a[1];
    var _b = (0, react_1.useState)(READ.wOpen()), wOpen = _b[0], setWOpen = _b[1];
    var _c = (0, react_1.useState)(READ.wClosed()), wClosed = _c[0], setWClosed = _c[1];
    var _d = (0, react_1.useState)(READ.headerH()), hHeader = _d[0], setHHeader = _d[1];
    var _e = (0, react_1.useState)(READ.mainBg()), mainBg = _e[0], setMainBg = _e[1];
    // реагируем на изменения настроек (страница Настройки → Интерфейс записывает в localStorage)
    (0, react_1.useEffect)(function () {
        var onStorage = function (e) {
            if (!e.key)
                return;
            if (e.key === "ui.sidebar.w_open")
                setWOpen(READ.wOpen());
            if (e.key === "ui.sidebar.w_closed")
                setWClosed(READ.wClosed());
            if (e.key === "ui.sidebar.open")
                setOpen(READ.sidebarOpen());
            if (e.key === "ui.header.height")
                setHHeader(READ.headerH());
            if (e.key === "ui.main.bg")
                setMainBg(READ.mainBg());
        };
        window.addEventListener("storage", onStorage);
        return function () { return window.removeEventListener("storage", onStorage); };
    }, []);
    var sidebarWidth = open ? wOpen : wClosed;
    // каркас: 2 колонки (меню | правая часть), 2 ряда (Header | контент)
    var rootStyle = {
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "".concat(sidebarWidth, "px 1fr"),
        gridTemplateRows: "".concat(hHeader, "px 1fr"),
        background: mainBg,
        color: "#E5E5E5",
    };
    var sidebarSlot = {
        gridColumn: 1,
        gridRow: "1 / span 2",
        zIndex: 5, // чтобы клик по «кубу» всегда работал
        width: "100%",
        height: "100%",
    };
    var headerSlot = {
        gridColumn: 2, // ВАЖНО: только правая колонка!
        gridRow: 1,
        zIndex: 3,
    };
    var mainSlot = {
        gridColumn: 2, // только правая колонка
        gridRow: 2,
        overflow: "auto",
        minHeight: 0,
    };
    // заголовок для HeaderBar по url
    var location = (0, react_router_dom_1.useLocation)();
    var _f = (function () {
        var parts = location.pathname.split("/").filter(Boolean);
        if (parts.length === 0)
            return ["ПАНЕЛЬ", "DASHBOARD"];
        var g = decodeURI(parts[0]).toUpperCase();
        var i = parts[1] ? decodeURI(parts[1]).toUpperCase() : "SECTION";
        return [g, i];
    })(), sectionGroup = _f[0], sectionItem = _f[1];
    return (<div style={rootStyle}>
      {/* Левая колонка */}
      <div style={sidebarSlot}>
        <LeftSidebar_1.default isOpen={open} onToggle={function () {
            var next = !open;
            setOpen(next);
            localStorage.setItem("ui.sidebar.open", next ? "1" : "0");
        }}/>
      </div>

      {/* Header — строго над правой колонкой */}
      <div style={headerSlot}>
        <HeaderBar_1.default sectionGroup={sectionGroup} sectionItem={sectionItem} userName="MASTER"/>
      </div>

      {/* Контент маршрутов */}
      <main style={mainSlot}>
        <react_router_dom_1.Outlet />
      </main>
    </div>);
}
