import { Grid, Card, CardContent, Typography, LinearProgress } from '@mui/material'

export default function Dashboard() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Обзор</Typography>
            <Typography variant="body2">Здесь будут графики и KPI. Пока — заглушка.</Typography>
            <LinearProgress sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Уведомления</Typography>
            <Typography variant="body2">Новых уведомлений нет.</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
