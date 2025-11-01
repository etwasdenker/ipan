import { Grid, Card, CardContent, Typography, TextField, Button } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid'

const columns: GridColDef[] = [
  { field: 'created', headerName: 'Создана', width: 180 },
  { field: 'number', headerName: 'Номер', width: 120 },
  { field: 'priority', headerName: 'Приоритет', width: 120 },
  { field: 'method', headerName: 'Метод', width: 160 },
  { field: 'stage', headerName: 'Этап', width: 160 },
  { field: 'site', headerName: 'Сайт', width: 160 },
  { field: 'org', headerName: 'Организация', width: 220 },
]

const rows = [
  { id: 1, created: '01.11.2025, 06:59', number: 'ПЗ5-0063', priority: '3', method: 'Заказ с сайта', stage: 'Новая', site: 'Hatz', org: 'ОМК' },
  { id: 2, created: '31.10.2025, 13:44', number: 'ТЗ5-0160', priority: '3', method: 'Быстрый заказ', stage: 'Отменена', site: 'Аккумуляторные батареи', org: 'СТ' },
]

export default function Orders() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Фильтр</Typography>
            <TextField label="Ответственный" fullWidth margin="dense" />
            <TextField label="Организация" fullWidth margin="dense" />
            <TextField label="Этап" fullWidth margin="dense" />
            <TextField label="Приоритет" fullWidth margin="dense" />
            <TextField label="Период" fullWidth margin="dense" />
            <TextField label="Теги" fullWidth margin="dense" />
            <Button variant="contained" sx={{ mt: 1, mr: 1 }}>Применить</Button>
            <Button variant="outlined" sx={{ mt: 1 }}>Очистить</Button>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={9}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Заявки</Typography>
            <div style={{ height: 520, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 }}}} />
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
