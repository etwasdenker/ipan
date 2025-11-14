import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // алиас на Workbench (вне фронта)
      '@workbench': path.resolve(__dirname, '../../workbench'),
    },
  },
  server: {
    fs: {
      // разрешаем Vite читать файлы за пределами root (workbench и корень репо)
      allow: [
        path.resolve(__dirname, '.'),                 // frontend/ipan
        path.resolve(__dirname, '../../workbench'),   // workbench
        path.resolve(__dirname, '../..'),             // корень репо
      ],
    },
  },
  optimizeDeps: {
    // на всякий случай подсказываем Vite предсобрать эти пакеты
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
  },
});
