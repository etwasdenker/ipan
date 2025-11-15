"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var node_path_1 = require("node:path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    resolve: {
        alias: {
            // алиас на Workbench (вне фронта)
            '@workbench': node_path_1.default.resolve(__dirname, '../../workbench'),
        },
    },
    server: {
        fs: {
            // разрешаем Vite читать файлы за пределами root (workbench и корень репо)
            allow: [
                node_path_1.default.resolve(__dirname, '.'), // frontend/ipan
                node_path_1.default.resolve(__dirname, '../../workbench'), // workbench
                node_path_1.default.resolve(__dirname, '../..'), // корень репо
            ],
        },
    },
    optimizeDeps: {
        // на всякий случай подсказываем Vite предсобрать эти пакеты
        include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
    },
});
