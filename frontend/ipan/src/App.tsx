import { useEffect, useMemo, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, useTheme } from '@mui/material/styles'
import { GlobalStyles, Box, Button, TextField, Typography, Stack, Paper } from '@mui/material'
import Layout from './components/Layout'
import SplitPane from './components/SplitPane'
import { darkTheme, lightTheme } from './theme/theme'

/**
 * Примеры страниц.
 * Для “Заявок” используем SplitPane (слева — фильтры, справа — список).
 */

function DashboardPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Панель — заглушка</Typography>
      <Typography variant="body1">Здесь будут виджеты и сводки.</Typography>
    </Box>
  )
}

function OrdersPage() {
  const left = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Фильтр</Typography>
      <Stack spacing={2}>
        <TextField size="small" fullWidth label="Ответственный" />
        <TextField size="small" fullWidth label="Организация" />
        <TextField size="small" fullWidth label="Этап" />
        <TextField size="small" fullWidth label="Приоритет" />
        <TextField size="small" fullWidth label="Период" />
        <TextField size="small" fullWidth label="Теги" />
        <Stack direction="row" spacing={1}>
          <Button variant="contained">Применить</Button>
          <Button>Очистить</Button>
        </Stack>
      </Stack>
    </Box>
  )

  const right = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Заявки</Typography>
      <Stack spacing={1}>
        {Array.from({ length: 18 }).map((_, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="body2">Заявка #{(i + 1).toString().padStart(3, '0')}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )

  return <SplitPane left={left} right={right} initialLeft={380} minLeft={240} maxLeft={800} />
}

function Placeholder({ title }: { title: string }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{title}</Typography>
      <Typography variant="body1">Контент будет добавлен позже.</Typography>
    </Box>
  )
}

function NotFound() {
  return <Placeholder title="Страница не найдена" />
}

export default function App() {
  // режим темы
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ipan.theme')
    if (saved) return saved === 'dark'
    return true
  })
  useEffect(() => { localStorage.setItem('ipan.theme', darkMode ? 'dark' : 'light') }, [darkMode])

  const theme = useMemo(() => (darkMode ? darkTheme : lightTheme), [darkMode])

  return (
    <ThemeProvider theme={theme}>
      {/* Глобальные стили: скроллбары под тему + мелкие визуальные штрихи */}
      <GlobalStyles styles={(t) => ({
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: t.palette.mode === 'dark'
            ? 'rgba(255,255,255,.25) transparent'
            : 'rgba(0,0,0,.25) transparent',
        },
        '::-webkit-scrollbar': { width: 10, height: 10 },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: t.palette.mode === 'dark'
            ? 'rgba(255,255,255,.25)'
            : 'rgba(0,0,0,.25)',
          borderRadius: 8,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
        body: {
          margin: 0,
          backgroundColor: t.palette.background.default,
          color: t.palette.text.primary,
        },
      })} />

      {/* Layout включает AppBar и левое меню; сюда кладём маршруты как children */}
      <Layout onToggleTheme={() => setDarkMode((v) => !v)} darkMode={darkMode}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/v/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />

          {/* Примеры-заглушки для новых пунктов меню */}
          <Route path="/v/tasks" element={<Placeholder title="Задачи" />} />
          <Route path="/v/comments" element={<Placeholder title="Комментарии" />} />
          <Route path="/v/comms" element={<Placeholder title="Коммуникации" />} />
          <Route path="/v/tags" element={<Placeholder title="Теги" />} />

          <Route path="/v/contacts" element={<Placeholder title="Контакты" />} />
          <Route path="/v/counterparty" element={<Placeholder title="Контрагенты" />} />
          <Route path="/v/users" element={<Placeholder title="Пользователи" />} />
          <Route path="/v/groups" element={<Placeholder title="Группы пользователей" />} />
          <Route path="/v/warehouses" element={<Placeholder title="Склады" />} />

          <Route path="/v/products" element={<Placeholder title="Товары и услуги" />} />
          <Route path="/v/articles" element={<Placeholder title="Статьи" />} />
          <Route path="/v/brands" element={<Placeholder title="Бренды" />} />
          <Route path="/v/kinds" element={<Placeholder title="Виды номенклатуры" />} />
          <Route path="/v/chars" element={<Placeholder title="Характеристики" />} />
          <Route path="/v/units" element={<Placeholder title="Единицы измерения" />} />

          <Route path="/v/quotes" element={<Placeholder title="Предложения" />} />
          <Route path="/v/invoices" element={<Placeholder title="Счета" />} />

          <Route path="/v/payments" element={<Placeholder title="Платежи" />} />
          <Route path="/v/contracts" element={<Placeholder title="Договоры" />} />
          <Route path="/v/sales" element={<Placeholder title="Реализации" />} />
          <Route path="/v/receipts" element={<Placeholder title="Поступления" />} />
          <Route path="/v/shipments" element={<Placeholder title="Отгрузки" />} />
          <Route path="/v/bills_in" element={<Placeholder title="Входящие счета" />} />
          <Route path="/v/letters" element={<Placeholder title="Официальные письма" />} />

          <Route path="/v/mails" element={<Placeholder title="Mails" />} />
          <Route path="/v/sites" element={<Placeholder title="Сайты" />} />
          <Route path="/v/actions" element={<Placeholder title="Акции" />} />
          <Route path="/v/leads" element={<Placeholder title="Запросы" />} />
          <Route path="/v/tones" element={<Placeholder title="TONES" />} />

          <Route path="/v/mailing" element={<Placeholder title="Mailing" />} />
          <Route path="/v/parcing" element={<Placeholder title="Parcing" />} />

          <Route path="/settings" element={<Placeholder title="Настройки" />} />

          <Route path="/v/lex_docs" element={<Placeholder title="LEX · Документация" />} />
          <Route path="/v/lex_tasks" element={<Placeholder title="LEX · Задачи" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}
