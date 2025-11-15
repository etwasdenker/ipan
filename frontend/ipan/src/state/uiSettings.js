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
exports.setChildIndentPx = setChildIndentPx;
exports.setGroupFontWeight = setGroupFontWeight;
exports.setChildFontWeight = setChildFontWeight;
exports.setLeftSidebarBg = setLeftSidebarBg;
exports.setSidebarWidthOpen = setSidebarWidthOpen;
exports.setSidebarWidthCollapsed = setSidebarWidthCollapsed;
exports.setShowSidebarSeparator = setShowSidebarSeparator;
exports.setHeaderBg = setHeaderBg;
exports.setHeaderHeight = setHeaderHeight;
exports.setShowHeaderSeparator = setShowHeaderSeparator;
exports.setLineColor = setLineColor;
exports.useUISettings = useUISettings;
var react_1 = require("react");
var STORAGE_KEY = "ipan.ui.settings.v2";
function defaults() {
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
function load() {
    var d = defaults();
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return d;
        var p = JSON.parse(raw);
        return __assign(__assign({}, d), p);
    }
    catch (_a) {
        return d;
    }
}
var state = load();
var subs = new Set();
var emit = function () { return subs.forEach(function (fn) { return fn(); }); };
var save = function () {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    catch (_a) { }
};
// helpers
var clamp = function (n, min, max) { return Math.max(min, Math.min(max, Math.round(n))); };
var clampWeight = function (n) { return clamp(n, 100, 900); };
// ========== setters (бывшие) ==========
function setChildIndentPx(n) {
    state = __assign(__assign({}, state), { childIndentPx: clamp(n, 0, 120) });
    save();
    emit();
}
function setGroupFontWeight(n) {
    state = __assign(__assign({}, state), { groupFontWeight: clampWeight(n) });
    save();
    emit();
}
function setChildFontWeight(n) {
    state = __assign(__assign({}, state), { childFontWeight: clampWeight(n) });
    save();
    emit();
}
// ========== setters (НОВЫЕ) ==========
function setLeftSidebarBg(v) {
    state = __assign(__assign({}, state), { leftSidebarBg: v || "#0f1010" });
    save();
    emit();
}
function setSidebarWidthOpen(n) {
    state = __assign(__assign({}, state), { sidebarWidthOpen: clamp(n, 220, 480) });
    save();
    emit();
}
function setSidebarWidthCollapsed(n) {
    state = __assign(__assign({}, state), { sidebarWidthCollapsed: clamp(n, 44, 80) });
    save();
    emit();
}
function setShowSidebarSeparator(b) {
    state = __assign(__assign({}, state), { showSidebarSeparator: !!b });
    save();
    emit();
}
function setHeaderBg(v) {
    state = __assign(__assign({}, state), { headerBg: v || "#353535" });
    save();
    emit();
}
function setHeaderHeight(n) {
    state = __assign(__assign({}, state), { headerHeight: clamp(n, 40, 120) });
    save();
    emit();
}
function setShowHeaderSeparator(b) {
    state = __assign(__assign({}, state), { showHeaderSeparator: !!b });
    save();
    emit();
}
function setLineColor(v) {
    state = __assign(__assign({}, state), { lineColor: v || "#3C3C3C" });
    save();
    emit();
}
// ========== hook ==========
function useUISettings() {
    return (0, react_1.useSyncExternalStore)(function (cb) { subs.add(cb); return function () { return subs.delete(cb); }; }, function () { return state; }, function () { return state; });
}
