"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SplitPane;
exports.VerticalDivider = VerticalDivider;
exports.HorizontalDivider = HorizontalDivider;
// frontend/ipan/src/components/SplitPane.tsx
var react_1 = require("react");
// Ничего не рисуем и ничего не перехватываем.
// Даже если страницы продолжают импортировать SplitPane/Divider — мы их глушим.
function SplitPane(_a) {
    var children = _a.children;
    return <>{children}</>;
}
// Если где-то импортируется именованный Divider — он тоже «молчит».
function VerticalDivider() {
    return null;
}
function HorizontalDivider() {
    return null;
}
