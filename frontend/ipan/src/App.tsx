import { useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { lightTheme, darkTheme } from './theme/theme'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import LEX from './pages/LEX'
import { Routes, Route } from 'react-router-dom'
import { CssBaseline } from '@mui/material'

export default function App() {
  const [dark, setDark] = useState(true)
  const theme = useMemo(() => (dark ? darkTheme : lightTheme), [dark])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout darkMode={dark} onToggleTheme={() => setDark(!dark)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/lex" element={<LEX />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}
