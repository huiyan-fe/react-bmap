import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-bmap': resolve(__dirname, '../src/index.ts'),
    },
  },
  root: __dirname,
  // 从仓库根目录读取 .env（单一 ak 来源 VITE_BMAP_AK），与 examples 应用共用同一份
  envDir: resolve(__dirname, '..'),
  server: {
    port: 8091,
  },
});
