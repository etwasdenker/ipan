import { Box, Paper, Typography } from '@mui/material'
import SplitPane from '../components/SplitPane'

function Placeholder({ label }: { label: string }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700 }}>{label}</Typography>
    </Box>
  )
}

export default function Dashboard() {
  return (
    <Box sx={{ height: '100%' }}>
      <SplitPane direction="vertical" initial={28} minA={16} minB={20} storageKey="ipan:dash:main" height="100%">
        {/* слева: фильтр/каталог (горизонтальный сплит) */}
        <SplitPane direction="horizontal" initial={40} minA={16} minB={16} storageKey="ipan:dash:left">
          <Box sx={{ height: '100%', borderRight: '2px solid', borderColor: 'divider', borderBottom: '2px solid' }}>
            <Placeholder label="filters_block" />
          </Box>
          <Box sx={{ height: '100%', borderRight: '2px solid', borderColor: 'divider' }}>
            <Placeholder label="catalogue_list" />
          </Box>
        </SplitPane>

        {/* центр: основное окно */}
        <Paper sx={{ height: '100%' }}>
          <Placeholder label="main_content_window" />
        </Paper>
      </SplitPane>
    </Box>
  )
}
