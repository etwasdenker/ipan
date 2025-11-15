"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Stub;
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var NAMES = {
    dashboard: 'Dashboard', tasks: 'Задачи', comments: 'Комментарии', comms: 'Коммуникации', tags: 'Теги',
    contacts: 'Контакты', counterparty: 'Контрагенты', users: 'Пользователи', groups: 'Группы пользователей', warehouses: 'Склады',
    products: 'Товары и услуги', chars: 'Характеристик', brands: 'Бренды', units: 'Единицы измерения', kinds: 'Виды номенклатуры',
    quotes: 'Коммерческие предложения', invoices: 'Счета',
    payments: 'Платежи', contracts: 'Договоры', sales: 'Реализации', receipts: 'Поступления', shipments: 'Отгрузки',
    bills_in: 'Входящие счета', letters: 'Официальные письма',
    lex_docs: 'LEX: Документация', lex_tasks: 'LEX: Задачи',
};
function Stub() {
    var key = (0, react_router_dom_1.useParams)().key;
    var title = (key && NAMES[key]) || 'Раздел';
    return (<material_1.Box sx={{ p: 2 }}>
      <material_1.Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>{title}</material_1.Typography>
      <material_1.Typography variant="body2" color="text.secondary">
        Заглушка. Здесь будет интерфейс «{title}».
      </material_1.Typography>
    </material_1.Box>);
}
