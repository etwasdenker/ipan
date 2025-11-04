import { useState, useEffect, PropsWithChildren } from 'react'
import {
  AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Box, Divider, Tooltip, useTheme
} from '@mui/material'
import Collapse from '@mui/material/Collapse'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { Link, useLocation } from 'react-router-dom'
import TabsBar from './TabsBar'
import useMediaQuery from '@mui/material/useMediaQuery'

const APPBAR_HEIGHT = 80
const drawerWidth = 260
const miniWidth   = 80
const PARENT_H    = 60
const API = 'http://127.0.0.1:8000'

function MonoIcon({ src, size = 24, color = 'text.primary' }: {src:string, size?:number, color?:string}) {
  return (
    <Box
      sx={(theme)=>({
        width: size, height: size,
        bgcolor: (theme.palette as any)[color?.split('.')[0]]?.[color?.split('.')[1] || 'primary'] || theme.palette.text.primary,
        mask: `url(${src}) no-repeat center / contain`,
        WebkitMask: `url(${src}) no-repeat center / contain`
      })}
    />
  )
}

type Child  = { id: string, label: string, to: string, icon?: string }
type Parent = { id: string, title: string, icon: string, children: Child[] }

const NAV: Parent[] = [
  {
    id: 'panel', title: 'ПАНЕЛЬ', icon: '/brand/folder.svg',
    children: [
      { id: 'dashboard',  label: 'Dashboard',     to: '/v/dashboard',  icon: '/brand/folder.svg' },
      { id: 'tasks',      label: 'Задачи',        to: '/v/tasks',       icon: '/brand/folder.svg' },
      { id: 'comments',   label: 'Комментарии',   to: '/v/comments',    icon: '/brand/folder.svg' },
      { id: 'comms',      label: 'Коммуникации',  to: '/v/comms',       icon: '/brand/folder.svg' },
      { id: 'tags',       label: 'Теги',          to: '/v/tags',        icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'struct', title: 'СТРУКТУРА', icon: '/brand/folder.svg',
    children: [
      { id: 'contacts',     label: 'Контакты',             to: '/v/contacts',      icon: '/brand/folder.svg' },
      { id: 'counterparty', label: 'Контрагенты',          to: '/v/counterparty',  icon: '/brand/folder.svg' },
      { id: 'users',        label: 'Пользователи',         to: '/v/users',         icon: '/brand/folder.svg' },
      { id: 'groups',       label: 'Группы пользователей', to: '/v/groups',        icon: '/brand/folder.svg' },
      { id: 'warehouses',   label: 'Склады',               to: '/v/warehouses',    icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'content', title: 'КОНТЕНТ', icon: '/brand/folder.svg',
    children: [
      { id: 'products',  label: 'Товары и услуги',   to: '/v/products',  icon: '/brand/folder.svg' },
      { id: 'articles',  label: 'Статьи',            to: '/v/articles',  icon: '/brand/folder.svg' },
      { id: 'brands',    label: 'Бренды',            to: '/v/brands',    icon: '/brand/folder.svg' },
      { id: 'kinds',     label: 'Виды номенклатуры', to: '/v/kinds',     icon: '/brand/folder.svg' },
      { id: 'chars',     label: 'Характеристики',    to: '/v/chars',     icon: '/brand/folder.svg' },
      { id: 'units',     label: 'Единицы измерения', to: '/v/units',     icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'process', title: 'ПРОЦЕСС', icon: '/brand/folder.svg',
    children: [
      { id: 'orders',   label: 'Заявки',         to: '/orders',      icon: '/brand/folder.svg' },
      { id: 'quotes',   label: 'Предложения',    to: '/v/quotes',    icon: '/brand/folder.svg' },
      { id: 'invoices', label: 'Счета',          to: '/v/invoices',  icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'docs', title: 'ДОКУМЕНТЫ', icon: '/brand/folder.svg',
    children: [
      { id: 'payments',  label: 'Платежи',            to: '/v/payments',   icon: '/brand/folder.svg' },
      { id: 'contracts', label: 'Договоры',           to: '/v/contracts',  icon: '/brand/folder.svg' },
      { id: 'sales',     label: 'Реализации',         to: '/v/sales',      icon: '/brand/folder.svg' },
      { id: 'receipts',  label: 'Поступления',        to: '/v/receipts',   icon: '/brand/folder.svg' },
      { id: 'shipments', label: 'Отгрузки',           to: '/v/shipments',  icon: '/brand/folder.svg' },
      { id: 'bills_in',  label: 'Входящие счета',     to: '/v/bills_in',   icon: '/brand/folder.svg' },
      { id: 'letters',   label: 'Официальные письма', to: '/v/letters',    icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'mkt', title: 'МАРКЕТИНГ', icon: '/brand/folder.svg',
    children: [
      { id: 'mails',   label: 'Mails',   to: '/v/mails',   icon: '/brand/folder.svg' },
      { id: 'sites',   label: 'Сайты',   to: '/v/sites',   icon: '/brand/folder.svg' },
      { id: 'actions', label: 'Акции',   to: '/v/actions', icon: '/brand/folder.svg' },
      { id: 'leads',   label: 'Запросы', to: '/v/leads',   icon: '/brand/folder.svg' },
      { id: 'tones',   label: 'TONES',   to: '/v/tones',   icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'scripts', title: 'СКРИПТЫ', icon: '/brand/folder.svg',
    children: [
      { id: 'mailing', label: 'Mailing', to: '/v/mailing', icon: '/brand/folder.svg' },
      { id: 'parcing', label: 'Parcing', to: '/v/parcing', icon: '/brand/folder.svg' },
    ]
  },
  {
    id: 'lex', title: 'LEX', icon: '/brand/folder.svg',
    children: [
      { id: 'lex_docs',  label: 'Документация', to: '/v/lex_docs',  icon: '/brand/folder.svg' },
      { id: 'lex_tasks', label: 'Задачи LEX',   to: '/v/lex_tasks', icon: '/brand/folder.svg' },
    ]
  },
]

const BOTTOM_ACTIONS = [
  { id: 'refresh',  title: 'ОБНОВИТЬ',  icon: '/brand/refresh.svg' as const },
  { id: 'settings', title: 'НАСТРОЙКИ', icon: '/brand/options.svg' as const, to: '/settings' },
]

type Props = PropsWithChildren<{ onToggleTheme: () => void, darkMode: boolean }>

export default function Layout({ children, onToggleTheme, darkMode }: Props) {
  const theme = useTheme()
  const lgUp = useMediaQuery('(min-width:900px)')
  const [open, setOpen] = useState(true)
  const location = useLocation()
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['panel','process','lex','content']))

  const [dbOk, setDbOk] = useState<boolean | null>(null)
  useEffect(() => {
    let stop = false
    const ping = async () => {
      try { const r = await fetch(`${API}/db/ping`); const j = await r.json(); if (!stop) setDbOk(!!j.ok) }
      catch { if (!stop) setDbOk(false) }
    }
    ping(); const id = setInterval(ping, 10000); return () => { stop = true; clearInterval(id) }
  }, [])
  const statusColor = dbOk === null ? 'warning.main' : dbOk ? 'success.main' : 'error.main'
  const statusText  = dbOk === null ? 'DB: …'         : dbOk ? 'DB: online' : 'DB: offline'

  const drawerSx = {
    width: open ? drawerWidth : miniWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
    '& .MuiDrawer-paper': {
      width: open ? drawerWidth : miniWidth,
      overflowX: 'hidden',
      boxSizing: 'border-box' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter
      }),
      borderRight: '2px solid',
      borderColor: 'divider',
    }
  }

  const toggleParent = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <Box sx={{ display: 'flex', minWidth: 0 }}>
      <CssBaseline />

      <AppBar position="fixed" color="default"
        sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider' }}>
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT, alignItems: 'center', position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
               onClick={() => setOpen(!open)}>
            <MonoIcon src="/brand/logo_ipan.svg" size={28} />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>IPAN</Typography>
          </Box>

          <Box sx={{
            position: 'absolute',
            left: (open ? drawerWidth : miniWidth) + 16,
            top: '50%',
            transform: 'translateY(-50%)',
            maxWidth: '60%',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>
            <Typography variant="h6" sx={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '0.1em' }}>
              IPAN · Group_N · Section_M
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor }} />
            <Typography variant="caption">{statusText}</Typography>
          </Box>

          <Tooltip title={darkMode ? 'Тёмная тема' : 'Светлая тема'}>
            <IconButton onClick={onToggleTheme} color="primary" sx={{ mr: 2 }}>
              {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Typography variant="subtitle2">Master</Typography>
            <MonoIcon src="/brand/account.svg" size={24} />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={lgUp ? 'permanent' : 'temporary'}
        open={lgUp ? true : open}
        onClose={() => setOpen(false)}
        sx={drawerSx}
      >
        <Toolbar sx={{
          minHeight: APPBAR_HEIGHT, px: open ? 2 : 0,
          justifyContent: open ? 'space-between' : 'center', alignItems: 'center', gap: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
               onClick={() => setOpen(!open)}>
            <MonoIcon src="/brand/logo_ipan.svg" size={24} />
            {open && <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>IPAN</Typography>}
          </Box>
          {open && (
            <IconButton onClick={() => setOpen(false)} size="small" title="Свернуть левую панель">
              <MonoIcon src="/brand/left_panel.svg" size={22} />
            </IconButton>
          )}
        </Toolbar>

        <Divider />

        <List sx={{ px: open ? 0.5 : 0 }}>
          {NAV.map(group => {
            const isOpen = expanded.has(group.id)
            return (
              <Box key={group.id}>
                {/* ГОЛОВНОЙ пункт: БЕЗ активной подсветки и фона */}
                <ListItemButton
                  onClick={() => toggleParent(group.id)}
                  sx={{
                    position: 'relative',
                    minHeight: PARENT_H, mt: 0.25, mb: 0.25,
                    px: open ? 2 : 1.25,
                    justifyContent: open ? 'initial' : 'center',
                    '&.Mui-selected': { backgroundColor: 'transparent !important' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : 0, justifyContent: 'center', width: 28 }}>
                    <MonoIcon src={group.icon} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={group.title}
                      primaryTypographyProps={{ sx: { fontWeight: 640, fontSize: '0.9rem', letterSpacing: '0.1em' } }}
                    />
                  )}
                </ListItemButton>

                {/* Дочерние: индикатор только здесь; 4px и серый (divider). Без фиолетового фона */}
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List
                    component="div"
                    disablePadding
                    sx={{
                      pl: open ? 6 : 0, position: 'relative',
                      '&::before': {
                        content: '""', position: 'absolute', left: open ? 34 : '50%', top: 6, bottom: 6,
                        width: '1px', bgcolor: 'divider'
                      }
                    }}
                  >
                    {group.children.map(ch => {
                      const sel = location.pathname === ch.to
                      return (
                        <ListItemButton
                          key={ch.id}
                          component={Link}
                          to={ch.to}
                          selected={sel}
                          sx={{
                            position: 'relative',
                            minHeight: 42,
                            px: open ? 2 : 1.25,
                            justifyContent: open ? 'initial' : 'center',
                            '&.Mui-selected': { backgroundColor: 'transparent !important' },
                            '&.Mui-selected::after': {
                              content: '""', position: 'absolute', right: 0, top: 6, bottom: 6, width: '4px',
                              bgcolor: 'divider'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.25 : 0, justifyContent: 'center', width: 26 }}>
                            <MonoIcon src={ch.icon || '/brand/folder.svg'} size={22} />
                          </ListItemIcon>
                          {open && <ListItemText primary={ch.label} />}
                        </ListItemButton>
                      )
                    })}
                  </List>
                </Collapse>
              </Box>
            )
          })}
        </List>

        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ mb: 0.5 }} />
          <List sx={{ px: open ? 0.5 : 0 }}>
            {BOTTOM_ACTIONS.map(act => (
              <ListItemButton
                key={act.id}
                component={act.to ? Link : 'button'}
                to={act.to as any}
                onClick={act.id === 'refresh'
                  ? () => window.dispatchEvent(new CustomEvent('ipan:soft-refresh'))
                  : undefined}
                sx={{
                  position: 'relative',
                  minHeight: PARENT_H, mt: 0.25, mb: 0.25,
                  px: open ? 2 : 1.25,
                  justifyContent: open ? 'initial' : 'center',
                  '&.Mui-selected': { backgroundColor: 'transparent !important' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 1.5 : 0, justifyContent: 'center', width: 28 }}>
                  <MonoIcon src={act.icon} />
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={act.title}
                    primaryTypographyProps={{ sx: { fontWeight: 640, fontSize: '0.9rem', letterSpacing: '0.1em' } }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT }} />
        <TabsBar />
        <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>
      </Box>
    </Box>
  )
}
