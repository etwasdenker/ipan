// frontend/ipan/src/components/Layout.tsx
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import HeaderBar from "./HeaderBar";
import LeftSidebar from "./LeftSidebar";

// helpers: берём настройки из localStorage с дефолтами
const getBool = (k: string, d = true) => (localStorage.getItem(k) ?? (d ? "1" : "0")) === "1";
const getNum  = (k: string, d: number) => {
  const n = Number(localStorage.getItem(k));
  return Number.isFinite(n) && n > 0 ? n : d;
};
const getStr  = (k: string, d: string) => localStorage.getItem(k) || d;

const READ = {
  sidebarOpen: () => getBool("ui.sidebar.open", true),
  wOpen:       () => getNum("ui.sidebar.w_open", 280),
  wClosed:     () => getNum("ui.sidebar.w_closed", 56),
  headerH:     () => getNum("ui.header.height", 80),
  mainBg:      () => getStr("ui.main.bg", "#141414"),
};

export default function Layout() {
  // состояние ширин/высот и открытости
  const [open, setOpen]       = useState(READ.sidebarOpen());
  const [wOpen, setWOpen]     = useState(READ.wOpen());
  const [wClosed, setWClosed] = useState(READ.wClosed());
  const [hHeader, setHHeader] = useState(READ.headerH());
  const [mainBg, setMainBg]   = useState(READ.mainBg());

  // реагируем на изменения настроек (страница Настройки → Интерфейс записывает в localStorage)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === "ui.sidebar.w_open")   setWOpen(READ.wOpen());
      if (e.key === "ui.sidebar.w_closed") setWClosed(READ.wClosed());
      if (e.key === "ui.sidebar.open")     setOpen(READ.sidebarOpen());
      if (e.key === "ui.header.height")    setHHeader(READ.headerH());
      if (e.key === "ui.main.bg")          setMainBg(READ.mainBg());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const sidebarWidth = open ? wOpen : wClosed;
  const navigate = useNavigate();

  // каркас: 2 колонки (меню | правая часть), 2 ряда (Header | контент)
  const rootStyle: React.CSSProperties = {
    height: "100vh",
    display: "grid",
    gridTemplateColumns: `${sidebarWidth}px 1fr`,
    gridTemplateRows: `${hHeader}px 1fr`,
    background: mainBg,
    color: "#E5E5E5",
  };

  const sidebarSlot: React.CSSProperties = {
    gridColumn: 1,
    gridRow: "1 / span 2",
    zIndex: 5, // чтобы клик по «кубу» всегда работал
    width: "100%",
    height: "100%",
  };

  const headerSlot: React.CSSProperties = {
    gridColumn: 2, // ВАЖНО: только правая колонка!
    gridRow: 1,
    zIndex: 3,
  };

  const mainSlot: React.CSSProperties = {
    gridColumn: 2, // только правая колонка
    gridRow: 2,
    overflow: "auto",
    minHeight: 0,
  };

  // заголовок для HeaderBar по url
  const location = useLocation();
  const [sectionGroup, sectionItem] = (() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) return ["ПАНЕЛЬ", "DASHBOARD"];
    const g = decodeURI(parts[0]).toUpperCase();
    const i = parts[1] ? decodeURI(parts[1]).toUpperCase() : "SECTION";
    return [g, i];
  })();

  const handleToggleSidebar = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem("ui.sidebar.open", next ? "1" : "0");
  };

  const handleToggleTheme = () => {
    const next = mainBg === "#141414" ? "#f5f5f5" : "#141414";
    setMainBg(next);
    localStorage.setItem("ui.main.bg", next);
  };

  const currentPath = location.pathname.replace(/^\//, "");

  return (
    <div style={rootStyle}>
      {/* Левая колонка */}
      <div style={sidebarSlot}>
        <LeftSidebar
          collapsed={!open}
          onToggleCollapsed={handleToggleSidebar}
          onToggleTheme={handleToggleTheme}
          headerHeight={hHeader}
          onNavigate={(key) => navigate(`/${key}`)}
          currentPath={currentPath}
        />
      </div>

      {/* Header — строго над правой колонкой */}
      <div style={headerSlot}>
        <HeaderBar sectionGroup={sectionGroup} sectionItem={sectionItem} userName="MASTER" />
      </div>

      {/* Контент маршрутов */}
      <main style={mainSlot}>
        <Outlet />
      </main>
    </div>
  );
}
