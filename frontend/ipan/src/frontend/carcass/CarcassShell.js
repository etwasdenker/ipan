"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarcassShell = CarcassShell;
var react_1 = require("react");
var main_carcass_json_1 = require("./configs/main-carcass.json");
var config = main_carcass_json_1.default;
function CarcassShell(_a) {
    var _b;
    var header = _a.header, left = _a.left, main = _a.main, right = _a.right;
    var gridCols = "".concat(config.leftWidth, "px 1fr ").concat(Math.max((_b = config.rightWidth) !== null && _b !== void 0 ? _b : 0, 0), "px");
    var gridRows = "".concat(config.headerHeight, "px 1fr");
    var line = "1px solid ".concat(config.colors.line);
    return (<div style={{
            height: "100vh",
            background: config.colors.bodyBg,
            display: "grid",
            gridTemplateColumns: gridCols,
            gridTemplateRows: gridRows,
            gridTemplateAreas: "\"header header header\" \"left main right\""
        }}>
      {/* HEADER */}
      <div style={{
            gridArea: "header",
            background: config.colors.headerBg,
            borderBottom: config.showHeaderDivider ? line : "none"
        }}>
        {header}
      </div>

      {/* LEFT */}
      <div style={{
            gridArea: "left",
            borderRight: config.showLeftDivider ? line : "none",
            overflow: "hidden", // прокрутка внутри самого меню
            background: "transparent"
        }}>
        {left}
      </div>

      {/* MAIN */}
      <div style={{ gridArea: "main", overflow: "auto" }}>{main}</div>

      {/* RIGHT (опционально) */}
      {config.rightWidth && config.rightWidth > 0 ? (<div style={{ gridArea: "right", borderLeft: line, overflow: "auto" }}>{right}</div>) : (<div style={{ display: "none" }}/>)}
    </div>);
}
