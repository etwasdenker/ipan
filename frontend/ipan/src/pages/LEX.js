"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LEX;
var react_1 = require("react");
var material_1 = require("@mui/material");
var marked_1 = require("marked");
var files = [
    { label: 'README', path: '/lex/README.md' },
];
function LEX() {
    var _a = (0, react_1.useState)('<p>Выберите документ</p>'), content = _a[0], setContent = _a[1];
    var _b = (0, react_1.useState)(files[0].path), file = _b[0], setFile = _b[1];
    (0, react_1.useEffect)(function () {
        fetch(file).then(function (r) { return r.text(); }).then(function (md) { return setContent(marked_1.marked.parse(md)); });
    }, [file]);
    return (<material_1.Card>
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <material_1.Typography variant="h6">LEX (документация)</material_1.Typography>
          <material_1.TextField select size="small" value={file} onChange={function (e) { return setFile(e.target.value); }}>
            {files.map(function (f) { return <material_1.MenuItem key={f.path} value={f.path}>{f.label}</material_1.MenuItem>; })}
          </material_1.TextField>
        </material_1.Box>
        <div dangerouslySetInnerHTML={{ __html: content }}/>
      </material_1.CardContent>
    </material_1.Card>);
}
