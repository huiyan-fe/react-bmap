import { createContext, useContext } from 'react';
import type { BMapVersion, LoaderStatus } from '../types';
import type { BMapDriver } from '../drivers/types';

export interface BMapContextValue {
  status: LoaderStatus;
  driver: BMapDriver | null;
  version: BMapVersion;
  error: Error | null;
}

export const BMapContext = createContext<BMapContextValue>({
  status: 'loading',
  driver: null,
  version: '4.0',
  error: null,
});

export function useBMapContext(): BMapContextValue {
  return useContext(BMapContext);
}
