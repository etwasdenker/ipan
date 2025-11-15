"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lightTheme = exports.darkTheme = exports.tokens = void 0;
// frontend/ipan/src/theme/theme.ts
var styles_1 = require("@mui/material/styles");
exports.tokens = {
    headerBg: "#353535",
    appBgDark: "#141414",
    appBgLight: "#f7f3e9",
    sep: "#3C3C3C",
    sepHover: "#E5E5E5",
    ink: "#E5E5E5",
    accents: {
        sage: "#8faa8c",
        lavender: "#b8a6d9",
        cornflower: "#8eaedb",
        rose: "#cf9aac",
        amber: "#e7d18a",
        teal: "#82b5b1",
    },
};
// Базовая типографика: Amatic SC для заголовков/акцентов, Playpen Sans — для контента
var typography = {
    fontFamily: "\"Playpen Sans\", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    h1: { fontFamily: "\"Amatic SC\", cursive", fontWeight: 700, letterSpacing: 1 },
    h2: { fontFamily: "\"Amatic SC\", cursive", fontWeight: 700, letterSpacing: 1 },
    h3: { fontFamily: "\"Amatic SC\", cursive", fontWeight: 700, letterSpacing: 0.5 },
    button: { textTransform: "none", fontWeight: 600 },
};
exports.darkTheme = (0, styles_1.createTheme)({
    palette: {
        mode: "dark",
        background: { default: exports.tokens.appBgDark, paper: exports.tokens.appBgDark },
        text: { primary: exports.tokens.ink },
        primary: { main: exports.tokens.accents.lavender },
        secondary: { main: exports.tokens.accents.teal },
        divider: exports.tokens.sep,
    },
    typography: typography,
    components: {
        MuiCssBaseline: {
            styleOverrides: "\n        :root {\n          --header-bg: ".concat(exports.tokens.headerBg, ";\n          --app-bg: ").concat(exports.tokens.appBgDark, ";\n          --sep: ").concat(exports.tokens.sep, ";\n          --sep-hover: ").concat(exports.tokens.sepHover, ";\n          --ink: ").concat(exports.tokens.ink, ";\n        }\n        body { background: var(--app-bg); }\n      "),
        },
    },
});
exports.lightTheme = (0, styles_1.createTheme)({
    palette: {
        mode: "light",
        background: { default: exports.tokens.appBgLight, paper: "#fffdfa" },
        text: { primary: "#2a2a2a" },
        primary: { main: exports.tokens.accents.lavender },
        secondary: { main: exports.tokens.accents.teal },
        divider: "#e7e1d1",
    },
    typography: typography,
    components: {
        MuiCssBaseline: {
            styleOverrides: "\n        :root {\n          --header-bg: ".concat(exports.tokens.headerBg, ";\n          --app-bg: ").concat(exports.tokens.appBgLight, ";\n          --sep: #e7e1d1;\n          --sep-hover: #2a2a2a;\n          --ink: #2a2a2a;\n        }\n        body { background: var(--app-bg); }\n      "),
        },
    },
});
