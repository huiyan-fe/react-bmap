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
  server: {
    port: 8091,
  },
});
