import { useParams } from 'react-router-dom'
import { Box, Typography } from '@mui/material'

const NAMES: Record<string, string> = {
  dashboard: 'Dashboard', tasks: 'Задачи', comments: 'Комментарии', comms: 'Коммуникации', tags: 'Теги',
  contacts: 'Контакты', counterparty: 'Контрагенты', users: 'Пользователи', groups: 'Группы пользователей', warehouses: 'Склады',
  products: 'Товары и услуги', chars: 'Характеристик', brands: 'Бренды', units: 'Единицы измерения', kinds: 'Виды номенклатуры',
  quotes: 'Коммерческие предложения', invoices: 'Счета',
  payments: 'Платежи', contracts: 'Договоры', sales: 'Реализации', receipts: 'Поступления', shipments: 'Отгрузки',
  bills_in: 'Входящие счета', letters: 'Официальные письма',
  lex_docs: 'LEX: Документация', lex_tasks: 'LEX: Задачи',
}

export default function Stub() {
  const { key } = useParams()
  const title = (key && NAMES[key]) || 'Раздел'
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        Заглушка. Здесь будет интерфейс «{title}».
      </Typography>
    </Box>
  )
}
