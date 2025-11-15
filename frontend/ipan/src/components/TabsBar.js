"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabsBar;
var material_1 = require("@mui/material");
var react_1 = require("react");
function TabsBar() {
    var _a = (0, react_1.useState)(0), tab = _a[0], setTab = _a[1];
    return (<material_1.Box sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
      <material_1.Tabs value={tab} onChange={function (_, v) { return setTab(v); }} textColor="inherit" // не красим текст в пурпурный у активного
     sx={{
            pl: 0,
            minHeight: 42,
            '& .MuiTab-root': { minHeight: 42, color: 'text.primary' },
            '& .Mui-selected': { color: 'text.primary' }, // на всякий
        }} TabIndicatorProps={{ sx: { height: 4, bgcolor: 'text.primary' } }} // 4px, цвет как у текста
    >
        <material_1.Tab label="SECTION_1"/>
        <material_1.Tab label="SECTION_2"/>
        <material_1.Tab label="SECTION_K"/>
      </material_1.Tabs>
    </material_1.Box>);
}
