import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      // 引用 ambient 类型包（@baidumap/jsapi-v4-types）时，插件会按解析到的每个声明
      // 文件各插一行 reference，同一指令会重复上百行。这里按行去重，只保留首次出现。
      beforeWriteFile(filePath, content) {
        const seen = new Set<string>();
        const deduped = content
          .split('\n')
          .filter((line) => {
            if (!line.startsWith('/// <reference')) return true;
            if (seen.has(line)) return false;
            seen.add(line);
            return true;
          })
          .join('\n');
        return { filePath, content: deduped };
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactBMap',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
  },
});
