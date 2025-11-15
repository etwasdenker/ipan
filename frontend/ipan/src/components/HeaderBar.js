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
// frontend/ipan/src/components/HeaderBar.tsx
var react_1 = require("react");
/**
 * Источники значений для Header:
 *   ui.header.height      -> высота (px), по умолчанию 80
 *   ui.header.bg          -> фон, по умолчанию #353535
 *   ui.header.border      -> "1" если нужна нижняя линия, иначе "0"
 *   ui.separator.color    -> цвет линий, по умолчанию #3C3C3C
 *
 * Шрифты: "Amatic SC" как главный для Header.
 */
function getHeaderHeight() {
    var v = localStorage.getItem("ui.header.height");
    var n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 80;
}
function getHeaderBg() {
    return localStorage.getItem("ui.header.bg") || "#353535";
}
function getHeaderBorder() {
    return (localStorage.getItem("ui.header.border") || "0") === "1";
}
function getSeparatorColor() {
    return localStorage.getItem("ui.separator.color") || "#3C3C3C";
}
function two(n) {
    return String(n).padStart(2, "0");
}
var WEEKDAYS_RU = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];
function formatDateTime(d) {
    // Пример: "4 ноября 2025 · ВТ · 20:22"
    var day = d.getDate();
    var monthLong = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(d);
    var year = d.getFullYear();
    var wd = WEEKDAYS_RU[d.getDay()];
    var hh = two(d.getHours());
    var mm = two(d.getMinutes());
    return "".concat(day, " ").concat(monthLong, " ").concat(year, " \u00B7 ").concat(wd, " \u00B7 ").concat(hh, ":").concat(mm);
}
var HeaderBar = function (_a) {
    var _b = _a.sectionGroup, sectionGroup = _b === void 0 ? "ПАНЕЛЬ" : _b, _c = _a.sectionItem, sectionItem = _c === void 0 ? "DASHBOARD" : _c, _d = _a.userName, userName = _d === void 0 ? "Master" : _d;
    var _e = (0, react_1.useState)(new Date()), now = _e[0], setNow = _e[1];
    // таймер часов
    (0, react_1.useEffect)(function () {
        var t = setInterval(function () { return setNow(new Date()); }, 1000);
        return function () { return clearInterval(t); };
    }, []);
    var headerHeight = (0, react_1.useMemo)(getHeaderHeight, []);
    var headerBg = (0, react_1.useMemo)(getHeaderBg, []);
    var showBorder = (0, react_1.useMemo)(getHeaderBorder, []);
    var sepColor = (0, react_1.useMemo)(getSeparatorColor, []);
    var rootStyle = {
        height: headerHeight,
        background: headerBg,
        borderBottom: showBorder ? "1px solid ".concat(sepColor) : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        width: "100%", // В пределах основной (правой) колонки
        fontFamily: "\"Amatic SC\", \"Playpen Sans\", system-ui, -apple-system, \"Segoe UI\", Roboto, Arial",
        color: "#E5E5E5",
        letterSpacing: "0.06em",
    };
    var leftClusterStyle = {
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 0,
    };
    var midTitleStyle = {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
        fontSize: 26,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    };
    var rightClusterStyle = {
        display: "flex",
        alignItems: "center",
        gap: 16,
    };
    var iconButton = {
        cursor: "pointer",
        userSelect: "none",
        height: 36,
        width: 36,
        display: "grid",
        placeItems: "center",
        borderRadius: 8,
        border: "1px solid transparent",
    };
    var metaText = {
        fontWeight: 700,
        fontSize: 24,
    };
    return (<div className="headerBar" data-slot="header" style={rootStyle}>
      {/* Левый кластер: Back + Refresh + текущий раздел */}
      <div style={leftClusterStyle}>
        {/* Back — простой символ-стрелка, чтобы не тянуть лишние пакеты */}
        <div role="button" title="Назад" style={iconButton} onClick={function () { return window.history.length > 1 && window.history.back(); }}>
          {/* Символ стрелки влево */}
          <span style={{ fontSize: 22, lineHeight: 1, color: "#E5E5E5" }}>←</span>
        </div>

        {/* Refresh — брендовая иконка */}
        <div role="button" title="Обновить" style={iconButton} onClick={function () { return window.location.reload(); }}>
          <img src="/brand/refresh.svg" alt="refresh" style={{ height: 20, width: 20, display: "block", filter: "invert(90%)" }}/>
        </div>

        {/* Текущий раздел */}
        <div style={midTitleStyle} aria-label="current-section">
          <span>{sectionGroup}</span>
          <span>·</span>
          <span>{sectionItem}</span>
        </div>
      </div>

      {/* Правый кластер: пользователь · DB · дата/время */}
      <div style={rightClusterStyle}>
        {/* Пользователь */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/brand/account.svg" alt="user" style={{ height: 22, width: 22, display: "block", filter: "invert(90%)" }}/>
          <span style={__assign({}, metaText)}>{userName}</span>
        </div>

        {/* DB online (только иконка) */}
        <img src="/brand/base_online.svg" alt="db" title="DB online" style={{ height: 22, width: 22, display: "block", filter: "invert(90%)" }}/>

        {/* Дата/время */}
        <div style={metaText}>{formatDateTime(now)}</div>
      </div>
    </div>);
};
exports.default = HeaderBar;
