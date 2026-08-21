import { describe, it, expect } from 'vitest';
import * as api from '../index';

// 防退化护栏（L0 导出快照）：
// 冻结主入口的运行时导出集合。任何新增/删除/重命名 public export 都会让这里红，
// 快照 diff 会出现在 PR 里 —— 逼作者确认「这是有意的公共 API 变更」，
// 而不是重构时手滑漏导出。类型导出不在运行时存在，故只覆盖 value exports。
describe('public API 导出快照', () => {
  it('主入口运行时导出集合稳定', () => {
    const keys = Object.keys(api).sort();
    expect(keys).toMatchSnapshot();
  });
});
