import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// 独立于 lib 的 vite.config.ts：从 vitest/config 导入 defineConfig，
// 避免 test 字段在 vite 类型下报错，也不与 dts/lib 构建纠缠。
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // 每个用例前重置 mock，避免跨用例污染
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // 只统计纯逻辑资产（防退化的覆盖率地板见 thresholds）
      include: [
        'src/utils/**',
        'src/loader/**',
        'src/drivers/**',
        'src/const/**',
        'src/constants/**',
      ],
      exclude: ['src/**/*.test.*', 'src/**/__tests__/**'],
      thresholds: {
        // 纯逻辑层设地板，迭代时漏测分支会被 CI 红掉；组件层不设行覆盖数字
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
      },
    },
  },
});
