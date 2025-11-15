"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Orders;
var material_1 = require("@mui/material");
var SplitPane_1 = require("../components/SplitPane");
function Orders() {
    return (<material_1.Box sx={{ height: '100%' }}>
      <SplitPane_1.default direction="vertical" initial={34} minA={18} minB={30} storageKey="ipan:orders:split" height="100%">
        <material_1.Box sx={{ height: '100%', p: 2, borderRight: '2px solid', borderColor: 'divider' }}>
          <material_1.Typography variant="h6" sx={{ mb: 2 }}>Фильтр</material_1.Typography>
          <material_1.Stack spacing={1.25}>
            <material_1.TextField size="small" label="Ответственный"/>
            <material_1.TextField size="small" label="Организация"/>
            <material_1.TextField size="small" label="Этап"/>
            <material_1.TextField size="small" label="Приоритет"/>
            <material_1.TextField size="small" label="Период"/>
            <material_1.TextField size="small" label="Теги"/>
            <material_1.Stack direction="row" spacing={1}>
              <material_1.Button variant="contained">Применить</material_1.Button>
              <material_1.Button variant="outlined">Очистить</material_1.Button>
            </material_1.Stack>
          </material_1.Stack>
        </material_1.Box>

        <material_1.Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <material_1.Box sx={{ px: 2, py: 1.5, borderBottom: '2px solid', borderColor: 'divider' }}>
            <material_1.Typography variant="h6">Заявки</material_1.Typography>
          </material_1.Box>
          <material_1.Box sx={{ flex: 1, overflow: 'auto' }}>
            <material_1.List dense disablePadding>
              {['01.11.2025, 06:59', '31.10.2025, 13:44', '31.10.2025, 08:36'].map(function (t, i) { return (<material_1.ListItemButton key={i} sx={{ px: 2, py: 1, borderBottom: '2px solid', borderColor: 'divider' }}>
                  <material_1.ListItemText primary={t} secondary="Новая · Заказ с сайта · ПМК"/>
                </material_1.ListItemButton>); })}
            </material_1.List>
          </material_1.Box>
        </material_1.Box>
      </SplitPane_1.default>
    </material_1.Box>);
}
