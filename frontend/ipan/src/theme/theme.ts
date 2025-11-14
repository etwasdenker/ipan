// frontend/ipan/src/theme/theme.ts
import { createTheme } from "@mui/material/styles";

export const tokens = {
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
const typography = {
  fontFamily: `"Playpen Sans", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
  h1: { fontFamily: `"Amatic SC", cursive`, fontWeight: 700, letterSpacing: 1 },
  h2: { fontFamily: `"Amatic SC", cursive`, fontWeight: 700, letterSpacing: 1 },
  h3: { fontFamily: `"Amatic SC", cursive`, fontWeight: 700, letterSpacing: 0.5 },
  button: { textTransform: "none", fontWeight: 600 },
} as const;

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: tokens.appBgDark, paper: tokens.appBgDark },
    text: { primary: tokens.ink },
    primary: { main: tokens.accents.lavender },
    secondary: { main: tokens.accents.teal },
    divider: tokens.sep,
  },
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --header-bg: ${tokens.headerBg};
          --app-bg: ${tokens.appBgDark};
          --sep: ${tokens.sep};
          --sep-hover: ${tokens.sepHover};
          --ink: ${tokens.ink};
        }
        body { background: var(--app-bg); }
      `,
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: tokens.appBgLight, paper: "#fffdfa" },
    text: { primary: "#2a2a2a" },
    primary: { main: tokens.accents.lavender },
    secondary: { main: tokens.accents.teal },
    divider: "#e7e1d1",
  },
  typography,
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        :root {
          --header-bg: ${tokens.headerBg};
          --app-bg: ${tokens.appBgLight};
          --sep: #e7e1d1;
          --sep-hover: #2a2a2a;
          --ink: #2a2a2a;
        }
        body { background: var(--app-bg); }
      `,
    },
  },
});
