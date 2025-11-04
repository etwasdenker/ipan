import { createTheme } from '@mui/material/styles'

/** Единый набор типографики (Pangolin для всего приложения) */
export const baseTypography = {
  fontFamily: `'Pangolin', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
}

/** Общие переопределения для обоих режимов */
const components = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        boxShadow: 'none',
      },
    },
  },
}

/** Тёмная тема */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7C3AED' }, // фирменный пурпурный
    background: {
      default: '#0f1117',
      paper: '#141722',
    },
  },
  shape: { borderRadius: 8 },
  typography: baseTypography,
  components,
})

/** Светлая тема */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7C3AED' },
    background: {
      default: '#f7f7f9',
      paper: '#ffffff',
    },
  },
  shape: { borderRadius: 8 },
  typography: baseTypography,
  components,
})
