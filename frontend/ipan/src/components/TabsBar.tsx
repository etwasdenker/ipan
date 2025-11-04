import { Box, Tabs, Tab } from '@mui/material'
import { useState } from 'react'

export default function TabsBar() {
  const [tab, setTab] = useState(0)

  return (
    <Box sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        textColor="inherit"               // не красим текст в пурпурный у активного
        sx={{
          pl: 0,
          minHeight: 42,
          '& .MuiTab-root': { minHeight: 42, color: 'text.primary' },
          '& .Mui-selected': { color: 'text.primary' }, // на всякий
        }}
        TabIndicatorProps={{ sx: { height: 4, bgcolor: 'text.primary' } }} // 4px, цвет как у текста
      >
        <Tab label="SECTION_1" />
        <Tab label="SECTION_2" />
        <Tab label="SECTION_K" />
      </Tabs>
    </Box>
  )
}
