"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
var react_1 = require("react");
var MainLayout_1 = require("./frontend/layouts/MainLayout");
// Важно: Router должен оставаться ТОЛЬКО в main.tsx!
function App() {
    return <MainLayout_1.MainLayout />;
}
