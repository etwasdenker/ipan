import { Box, Stack, Typography, TextField, Button, List, ListItemButton, ListItemText } from '@mui/material'
import SplitPane from '../components/SplitPane'

export default function Orders() {
  return (
    <Box sx={{ height: '100%' }}>
      <SplitPane direction="vertical" initial={34} minA={18} minB={30} storageKey="ipan:orders:split" height="100%">
        <Box sx={{ height: '100%', p: 2, borderRight: '2px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Фильтр</Typography>
          <Stack spacing={1.25}>
            <TextField size="small" label="Ответственный" />
            <TextField size="small" label="Организация" />
            <TextField size="small" label="Этап" />
            <TextField size="small" label="Приоритет" />
            <TextField size="small" label="Период" />
            <TextField size="small" label="Теги" />
            <Stack direction="row" spacing={1}>
              <Button variant="contained">Применить</Button>
              <Button variant="outlined">Очистить</Button>
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Заявки</Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List dense disablePadding>
              {['01.11.2025, 06:59','31.10.2025, 13:44','31.10.2025, 08:36'].map((t, i) => (
                <ListItemButton key={i} sx={{ px: 2, py: 1, borderBottom: '2px solid', borderColor: 'divider' }}>
                  <ListItemText primary={t} secondary="Новая · Заказ с сайта · ПМК" />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>
      </SplitPane>
    </Box>
  )
}
