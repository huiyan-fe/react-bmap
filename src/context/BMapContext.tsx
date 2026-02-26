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

export const BMapProvider = BMapContext.Provider;
export { BMapContext };
