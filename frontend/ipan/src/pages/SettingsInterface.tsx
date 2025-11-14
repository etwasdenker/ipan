import React, { useEffect, useState } from "react";
import {
  useUISettings,
  setChildIndentPx, setGroupFontWeight, setChildFontWeight,
  setLeftSidebarBg, setSidebarWidthOpen, setSidebarWidthCollapsed, setShowSidebarSeparator,
  setHeaderBg, setHeaderHeight, setShowHeaderSeparator,
  setLineColor,
} from "../state/uiSettings";

const wrap: React.CSSProperties = {
  padding: 16, color: "#E5E5E5", fontFamily: "'Playpen Sans', system-ui, sans-serif",
};
const card: React.CSSProperties = {
  border: "1px solid #3C3C3C", borderRadius: 10, padding: 16, maxWidth: 720, background: "#141414", marginBottom: 16,
};

function NumberControl(props: {
  label: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; suffix?: string;
}) {
  const { label, min, max, step = 10, value, onChange, suffix } = props;
  return (
    <div style={card}>
      <label style={{ display: "block", marginBottom: 10, fontSize: 18 }}>{label}</label>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input type="range" min={min} max={max} step={step} value={value}
               onChange={(e) => onChange(parseInt(e.target.value || "0", 10))} style={{ flex: 1 }} />
        <input type="number" min={min} max={max} step={step} value={value}
               onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
               style={{ width: 110, background: "#0f1010", color: "#E5E5E5",
                        border: "1px solid #3C3C3C", borderRadius: 8, padding: "6px 10px", fontSize: 16 }} />
        {suffix && <span style={{ opacity: 0.7 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ColorControl(props: { label: string; value: string; onChange: (v: string) => void; }) {
  const { label, value, onChange } = props;
  return (
    <div style={card}>
      <label style={{ display: "block", marginBottom: 10, fontSize: 18 }}>{label}</label>
      <input type="color" value={value}
             onChange={(e) => onChange((e.target as HTMLInputElement).value)}
             style={{ width: 60, height: 36, background: "transparent", border: "1px solid #3C3C3C", borderRadius: 8 }} />
      <span style={{ marginLeft: 12, opacity: 0.8 }}>{value}</span>
    </div>
  );
}

function ToggleControl(props: { label: string; checked: boolean; onChange: (v: boolean) => void; }) {
  const { label, checked, onChange } = props;
  return (
    <div style={card}>
      <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        {label}
      </label>
    </div>
  );
}

export default function SettingsInterface() {
  const s = useUISettings();

  // локальные стейты для контроля слайдерами — отображаем актуальные значения
  const [indent, setIndent] = useState(s.childIndentPx);
  const [wGroup, setWGroup] = useState(s.groupFontWeight);
  const [wChild, setWChild] = useState(s.childFontWeight);

  const [leftBg, setLeftBg] = useState(s.leftSidebarBg);
  const [wOpen, setWOpen] = useState(s.sidebarWidthOpen);
  const [wCollapsed, setWCollapsed] = useState(s.sidebarWidthCollapsed);
  const [vSep, setVSep] = useState(s.showSidebarSeparator);

  const [hdrBg, setHdrBg] = useState(s.headerBg);
  const [hdrH, setHdrH] = useState(s.headerHeight);
  const [hSep, setHSep] = useState(s.showHeaderSeparator);

  const [lineColor, setLColor] = useState(s.lineColor);

  // синхронизация при внешних изменениях
  useEffect(() => { setIndent(s.childIndentPx); }, [s.childIndentPx]);
  useEffect(() => { setWGroup(s.groupFontWeight); }, [s.groupFontWeight]);
  useEffect(() => { setWChild(s.childFontWeight); }, [s.childFontWeight]);

  useEffect(() => { setLeftBg(s.leftSidebarBg); }, [s.leftSidebarBg]);
  useEffect(() => { setWOpen(s.sidebarWidthOpen); }, [s.sidebarWidthOpen]);
  useEffect(() => { setWCollapsed(s.sidebarWidthCollapsed); }, [s.sidebarWidthCollapsed]);
  useEffect(() => { setVSep(s.showSidebarSeparator); }, [s.showSidebarSeparator]);

  useEffect(() => { setHdrBg(s.headerBg); }, [s.headerBg]);
  useEffect(() => { setHdrH(s.headerHeight); }, [s.headerHeight]);
  useEffect(() => { setHSep(s.showHeaderSeparator); }, [s.showHeaderSeparator]);

  useEffect(() => { setLColor(s.lineColor); }, [s.lineColor]);

  return (
    <div style={wrap}>
      <h2 style={{ marginTop: 0, fontFamily: "'Amatic SC', cursive", fontSize: 36 }}>Настройки интерфейса</h2>

      {/* Левое меню */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Левое меню</h3>
      <ColorControl
        label="Цвет фона левого меню"
        value={leftBg}
        onChange={(v) => { setLeftBg(v); setLeftSidebarBg(v); }}
      />
      <NumberControl
        label="Ширина меню (развёрнуто)"
        min={220} max={480} step={2}
        value={wOpen}
        onChange={(v) => { setWOpen(v); setSidebarWidthOpen(v); }}
        suffix="px"
      />
      <NumberControl
        label="Ширина меню (свернуто)"
        min={44} max={80} step={1}
        value={wCollapsed}
        onChange={(v) => { setWCollapsed(v); setSidebarWidthCollapsed(v); }}
        suffix="px"
      />
      <ToggleControl
        label="Показывать вертикальную линию-границу справа от меню"
        checked={vSep}
        onChange={(b) => { setVSep(b); setShowSidebarSeparator(b); }}
      />

      {/* Header */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Header</h3>
      <ColorControl
        label="Цвет фона Header"
        value={hdrBg}
        onChange={(v) => { setHdrBg(v); setHeaderBg(v); }}
      />
      <NumberControl
        label="Высота Header"
        min={40} max={120} step={2}
        value={hdrH}
        onChange={(v) => { setHdrH(v); setHeaderHeight(v); }}
        suffix="px"
      />
      <ToggleControl
        label="Показывать горизонтальную линию-границу снизу Header"
        checked={hSep}
        onChange={(b) => { setHSep(b); setShowHeaderSeparator(b); }}
      />

      {/* Линии */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Отделяющие линии</h3>
      <ColorControl
        label="Цвет линий-разделителей"
        value={lineColor}
        onChange={(v) => { setLColor(v); setLineColor(v); }}
      />

      {/* Уже существующие параметры */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Существующие</h3>
      <NumberControl
        label="Смещение дочерних разделов меню (только в развёрнутом виде)"
        min={0} max={120} step={2}
        value={indent}
        onChange={(v) => { setIndent(v); setChildIndentPx(v); }}
        suffix="px"
      />
      <NumberControl
        label="Толщина шрифта головных разделов"
        min={100} max={900} step={10}
        value={wGroup}
        onChange={(v) => { setWGroup(v); setGroupFontWeight(v); }}
      />
      <NumberControl
        label="Толщина шрифта вложенных разделов"
        min={100} max={900} step={10}
        value={wChild}
        onChange={(v) => { setWChild(v); setChildFontWeight(v); }}
      />

      <p style={{ color: "#9aa0a6", fontSize: 14, marginTop: 8 }}>
        Все настройки сохраняются локально и автоматически применяются при следующем запуске.
      </p>
    </div>
  );
}
