import { useState, PropsWithChildren } from 'react'
import { AppBar, Toolbar, Typography, CssBaseline, Drawer, List, ListItemButton, ListItemIcon, ListItemText, IconButton, Box, Divider, Tooltip } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/SpaceDashboard'
import AssignmentIcon from '@mui/icons-material/Assignment'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { Link, useLocation } from 'react-router-dom'

const drawerWidth = 260

type Props = PropsWithChildren<{ onToggleTheme: () => void, darkMode: boolean }>

export default function Layout({ children, onToggleTheme, darkMode }: Props) {
  const [open, setOpen] = useState(true)
  const location = useLocation()

  const menu = [
    { to: '/', icon: <DashboardIcon />, label: 'Панель' },
    { to: '/orders', icon: <AssignmentIcon />, label: 'Заявки' },
    { to: '/lex', icon: <LibraryBooksIcon />, label: 'LEX' },
  ]

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" color="default" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>A.IPAN</Typography>
          <Tooltip title={darkMode ? 'Тёмная тема' : 'Светлая тема'}>
            <IconButton onClick={onToggleTheme} color="primary">
              {darkMode ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer variant="persistent" open={open} PaperProps={{ sx: { width: drawerWidth }}}>
        <Toolbar />
        <List>
          {menu.map((m) => (
            <ListItemButton key={m.to} component={Link} to={m.to} selected={location.pathname === m.to}>
              <ListItemIcon>{m.icon}</ListItemIcon>
              <ListItemText primary={m.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}
