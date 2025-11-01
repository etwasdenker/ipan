import { createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

export const brand = {
  primary: {
    main: '#7C3AED',
    light: '#9F67F6',
    dark: '#5B21B6',
    contrastText: '#ffffff'
  },
}

const base = {
  typography: {
    fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  },
  shape: { borderRadius: 16 },
  components: {
    MuiPaper: { defaultProps: { elevation: 1 } },
    MuiCard: { styleOverrides: { root: { borderRadius: 20 }}},
    MuiButton: { styleOverrides: { root: { borderRadius: 14, textTransform: 'none', fontWeight: 600 }}},
  }
}

export const lightTheme = createTheme(deepmerge({
  palette: { mode: 'light', primary: brand.primary, background: { default: '#f7f7fb', paper: '#ffffff' } },
}, base as any))

export const darkTheme = createTheme(deepmerge({
  palette: { mode: 'dark', primary: brand.primary, background: { default: '#0f1021', paper: '#15172b' } },
}, base as any))
