"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsInterface;
var react_1 = require("react");
var uiSettings_1 = require("../state/uiSettings");
var wrap = {
    padding: 16, color: "#E5E5E5", fontFamily: "'Playpen Sans', system-ui, sans-serif",
};
var card = {
    border: "1px solid #3C3C3C", borderRadius: 10, padding: 16, maxWidth: 720, background: "#141414", marginBottom: 16,
};
function NumberControl(props) {
    var label = props.label, min = props.min, max = props.max, _a = props.step, step = _a === void 0 ? 10 : _a, value = props.value, onChange = props.onChange, suffix = props.suffix;
    return (<div style={card}>
      <label style={{ display: "block", marginBottom: 10, fontSize: 18 }}>{label}</label>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input type="range" min={min} max={max} step={step} value={value} onChange={function (e) { return onChange(parseInt(e.target.value || "0", 10)); }} style={{ flex: 1 }}/>
        <input type="number" min={min} max={max} step={step} value={value} onChange={function (e) { return onChange(parseInt(e.target.value || "0", 10)); }} style={{ width: 110, background: "#0f1010", color: "#E5E5E5",
            border: "1px solid #3C3C3C", borderRadius: 8, padding: "6px 10px", fontSize: 16 }}/>
        {suffix && <span style={{ opacity: 0.7 }}>{suffix}</span>}
      </div>
    </div>);
}
function ColorControl(props) {
    var label = props.label, value = props.value, onChange = props.onChange;
    return (<div style={card}>
      <label style={{ display: "block", marginBottom: 10, fontSize: 18 }}>{label}</label>
      <input type="color" value={value} onChange={function (e) { return onChange(e.target.value); }} style={{ width: 60, height: 36, background: "transparent", border: "1px solid #3C3C3C", borderRadius: 8 }}/>
      <span style={{ marginLeft: 12, opacity: 0.8 }}>{value}</span>
    </div>);
}
function ToggleControl(props) {
    var label = props.label, checked = props.checked, onChange = props.onChange;
    return (<div style={card}>
      <label style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18 }}>
        <input type="checkbox" checked={checked} onChange={function (e) { return onChange(e.target.checked); }}/>
        {label}
      </label>
    </div>);
}
function SettingsInterface() {
    var s = (0, uiSettings_1.useUISettings)();
    // локальные стейты для контроля слайдерами — отображаем актуальные значения
    var _a = (0, react_1.useState)(s.childIndentPx), indent = _a[0], setIndent = _a[1];
    var _b = (0, react_1.useState)(s.groupFontWeight), wGroup = _b[0], setWGroup = _b[1];
    var _c = (0, react_1.useState)(s.childFontWeight), wChild = _c[0], setWChild = _c[1];
    var _d = (0, react_1.useState)(s.leftSidebarBg), leftBg = _d[0], setLeftBg = _d[1];
    var _e = (0, react_1.useState)(s.sidebarWidthOpen), wOpen = _e[0], setWOpen = _e[1];
    var _f = (0, react_1.useState)(s.sidebarWidthCollapsed), wCollapsed = _f[0], setWCollapsed = _f[1];
    var _g = (0, react_1.useState)(s.showSidebarSeparator), vSep = _g[0], setVSep = _g[1];
    var _h = (0, react_1.useState)(s.headerBg), hdrBg = _h[0], setHdrBg = _h[1];
    var _j = (0, react_1.useState)(s.headerHeight), hdrH = _j[0], setHdrH = _j[1];
    var _k = (0, react_1.useState)(s.showHeaderSeparator), hSep = _k[0], setHSep = _k[1];
    var _l = (0, react_1.useState)(s.lineColor), lineColor = _l[0], setLColor = _l[1];
    // синхронизация при внешних изменениях
    (0, react_1.useEffect)(function () { setIndent(s.childIndentPx); }, [s.childIndentPx]);
    (0, react_1.useEffect)(function () { setWGroup(s.groupFontWeight); }, [s.groupFontWeight]);
    (0, react_1.useEffect)(function () { setWChild(s.childFontWeight); }, [s.childFontWeight]);
    (0, react_1.useEffect)(function () { setLeftBg(s.leftSidebarBg); }, [s.leftSidebarBg]);
    (0, react_1.useEffect)(function () { setWOpen(s.sidebarWidthOpen); }, [s.sidebarWidthOpen]);
    (0, react_1.useEffect)(function () { setWCollapsed(s.sidebarWidthCollapsed); }, [s.sidebarWidthCollapsed]);
    (0, react_1.useEffect)(function () { setVSep(s.showSidebarSeparator); }, [s.showSidebarSeparator]);
    (0, react_1.useEffect)(function () { setHdrBg(s.headerBg); }, [s.headerBg]);
    (0, react_1.useEffect)(function () { setHdrH(s.headerHeight); }, [s.headerHeight]);
    (0, react_1.useEffect)(function () { setHSep(s.showHeaderSeparator); }, [s.showHeaderSeparator]);
    (0, react_1.useEffect)(function () { setLColor(s.lineColor); }, [s.lineColor]);
    return (<div style={wrap}>
      <h2 style={{ marginTop: 0, fontFamily: "'Amatic SC', cursive", fontSize: 36 }}>Настройки интерфейса</h2>

      {/* Левое меню */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Левое меню</h3>
      <ColorControl label="Цвет фона левого меню" value={leftBg} onChange={function (v) { setLeftBg(v); (0, uiSettings_1.setLeftSidebarBg)(v); }}/>
      <NumberControl label="Ширина меню (развёрнуто)" min={220} max={480} step={2} value={wOpen} onChange={function (v) { setWOpen(v); (0, uiSettings_1.setSidebarWidthOpen)(v); }} suffix="px"/>
      <NumberControl label="Ширина меню (свернуто)" min={44} max={80} step={1} value={wCollapsed} onChange={function (v) { setWCollapsed(v); (0, uiSettings_1.setSidebarWidthCollapsed)(v); }} suffix="px"/>
      <ToggleControl label="Показывать вертикальную линию-границу справа от меню" checked={vSep} onChange={function (b) { setVSep(b); (0, uiSettings_1.setShowSidebarSeparator)(b); }}/>

      {/* Header */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Header</h3>
      <ColorControl label="Цвет фона Header" value={hdrBg} onChange={function (v) { setHdrBg(v); (0, uiSettings_1.setHeaderBg)(v); }}/>
      <NumberControl label="Высота Header" min={40} max={120} step={2} value={hdrH} onChange={function (v) { setHdrH(v); (0, uiSettings_1.setHeaderHeight)(v); }} suffix="px"/>
      <ToggleControl label="Показывать горизонтальную линию-границу снизу Header" checked={hSep} onChange={function (b) { setHSep(b); (0, uiSettings_1.setShowHeaderSeparator)(b); }}/>

      {/* Линии */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Отделяющие линии</h3>
      <ColorControl label="Цвет линий-разделителей" value={lineColor} onChange={function (v) { setLColor(v); (0, uiSettings_1.setLineColor)(v); }}/>

      {/* Уже существующие параметры */}
      <h3 style={{ fontFamily: "'Amatic SC', cursive", fontSize: 28, margin: "20px 0 8px" }}>Существующие</h3>
      <NumberControl label="Смещение дочерних разделов меню (только в развёрнутом виде)" min={0} max={120} step={2} value={indent} onChange={function (v) { setIndent(v); (0, uiSettings_1.setChildIndentPx)(v); }} suffix="px"/>
      <NumberControl label="Толщина шрифта головных разделов" min={100} max={900} step={10} value={wGroup} onChange={function (v) { setWGroup(v); (0, uiSettings_1.setGroupFontWeight)(v); }}/>
      <NumberControl label="Толщина шрифта вложенных разделов" min={100} max={900} step={10} value={wChild} onChange={function (v) { setWChild(v); (0, uiSettings_1.setChildFontWeight)(v); }}/>

      <p style={{ color: "#9aa0a6", fontSize: 14, marginTop: 8 }}>
        Все настройки сохраняются локально и автоматически применяются при следующем запуске.
      </p>
    </div>);
}
