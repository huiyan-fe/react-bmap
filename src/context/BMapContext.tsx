import React, { createContext, useContext } from 'react';
import type { BMapContextValue } from '../types';

const BMapContext = createContext<BMapContextValue | null>(null);

export function useBMap(): BMapContextValue {
  const ctx = useContext(BMapContext);
  if (!ctx) {
    throw new Error('useBMap must be used within a Map component');
  }
  return ctx;
}

export function useBMapOptional(): BMapContextValue | null {
  return useContext(BMapContext);
}

/**
 * 内部使用的 Map 级 Context.Provider，由 <Map> 组件设置。
 * 顶层加载器 Provider 请使用 BMapProvider。
 */
export const BMapMapContextProvider = BMapContext.Provider;
export { BMapContext };
