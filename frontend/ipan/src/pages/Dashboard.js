"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
var material_1 = require("@mui/material");
var SplitPane_1 = require("../components/SplitPane");
function Placeholder(_a) {
    var label = _a.label;
    return (<material_1.Box sx={{ p: 2 }}>
      <material_1.Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700 }}>{label}</material_1.Typography>
    </material_1.Box>);
}
function Dashboard() {
    return (<material_1.Box sx={{ height: '100%' }}>
      <SplitPane_1.default direction="vertical" initial={28} minA={16} minB={20} storageKey="ipan:dash:main" height="100%">
        {/* слева: фильтр/каталог (горизонтальный сплит) */}
        <SplitPane_1.default direction="horizontal" initial={40} minA={16} minB={16} storageKey="ipan:dash:left">
          <material_1.Box sx={{ height: '100%', borderRight: '2px solid', borderColor: 'divider', borderBottom: '2px solid' }}>
            <Placeholder label="filters_block"/>
          </material_1.Box>
          <material_1.Box sx={{ height: '100%', borderRight: '2px solid', borderColor: 'divider' }}>
            <Placeholder label="catalogue_list"/>
          </material_1.Box>
        </SplitPane_1.default>

        {/* центр: основное окно */}
        <material_1.Paper sx={{ height: '100%' }}>
          <Placeholder label="main_content_window"/>
        </material_1.Paper>
      </SplitPane_1.default>
    </material_1.Box>);
}
