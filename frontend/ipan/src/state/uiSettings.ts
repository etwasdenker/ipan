import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ipan.ui.settings.v2";

export type Settings = {
  // уже были
  childIndentPx: number;
  groupFontWeight: number;
  childFontWeight: number;

  // НОВОЕ: левое меню и разделители
  leftSidebarBg: string;              // (1) цвет фона левого меню
  sidebarWidthOpen: number;           // (2) ширина меню раскрытого
  sidebarWidthCollapsed: number;      // (3) ширина меню свернутого
  showSidebarSeparator: boolean;      // (4) показывать вертикальный разделитель справа от меню

  // НОВОЕ: header
  headerBg: string;                   // (5) цвет фона Header
  headerHeight: number;               // (6) высота Header
  showHeaderSeparator: boolean;       // (7) показывать горизонтальный разделитель снизу Header

  // (8) единый цвет линий-разделителей
  lineColor: string;
};

function defaults(): Settings {
  return {
    childIndentPx: 24,
    groupFontWeight: 700,
    childFontWeight: 600,

    leftSidebarBg: "#0f1010",
    sidebarWidthOpen: 300,
    sidebarWidthCollapsed: 56,
    showSidebarSeparator: true,

    headerBg: "#353535",
    headerHeight: 56,
    showHeaderSeparator: false,

    lineColor: "#3C3C3C",
  };
}

function load(): Settings {
  const d = defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return d;
    const p = JSON.parse(raw);
    return { ...d, ...p };
  } catch {
    return d;
  }
}

let state: Settings = load();
const subs = new Set<() => void>();
const emit = () => subs.forEach((fn) => fn());
const save = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
};

// helpers
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(n)));
const clampWeight = (n: number) => clamp(n, 100, 900);

// ========== setters (бывшие) ==========
export function setChildIndentPx(n: number) {
  state = { ...state, childIndentPx: clamp(n, 0, 120) }; save(); emit();
}
export function setGroupFontWeight(n: number) {
  state = { ...state, groupFontWeight: clampWeight(n) }; save(); emit();
}
export function setChildFontWeight(n: number) {
  state = { ...state, childFontWeight: clampWeight(n) }; save(); emit();
}

// ========== setters (НОВЫЕ) ==========
export function setLeftSidebarBg(v: string) {
  state = { ...state, leftSidebarBg: v || "#0f1010" }; save(); emit();
}
export function setSidebarWidthOpen(n: number) {
  state = { ...state, sidebarWidthOpen: clamp(n, 220, 480) }; save(); emit();
}
export function setSidebarWidthCollapsed(n: number) {
  state = { ...state, sidebarWidthCollapsed: clamp(n, 44, 80) }; save(); emit();
}
export function setShowSidebarSeparator(b: boolean) {
  state = { ...state, showSidebarSeparator: !!b }; save(); emit();
}

export function setHeaderBg(v: string) {
  state = { ...state, headerBg: v || "#353535" }; save(); emit();
}
export function setHeaderHeight(n: number) {
  state = { ...state, headerHeight: clamp(n, 40, 120) }; save(); emit();
}
export function setShowHeaderSeparator(b: boolean) {
  state = { ...state, showHeaderSeparator: !!b }; save(); emit();
}

export function setLineColor(v: string) {
  state = { ...state, lineColor: v || "#3C3C3C" }; save(); emit();
}

// ========== hook ==========
export function useUISettings() {
  return useSyncExternalStore<Settings>(
    (cb) => { subs.add(cb); return () => subs.delete(cb); },
    () => state,
    () => state
  );
}
