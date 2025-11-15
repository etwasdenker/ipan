import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { createRequire } from 'node:module';

const requireFromFrontend = createRequire(import.meta.url);

function workbenchModuleResolver() {
  return {
    name: 'workbench-module-resolver',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
      if (!importer) return null;
      if (!importer.includes(`${path.sep}workbench${path.sep}`)) return null;
      if (source.startsWith('.') || source.startsWith('/') || source.startsWith('data:')) {
        return null;
      }

      try {
        return requireFromFrontend.resolve(source);
      } catch (error) {
        return null;
      }
    },
  };
}

export default defineConfig({
  plugins: [workbenchModuleResolver(), react()],
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
