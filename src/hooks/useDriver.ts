import { useBMapContext } from '../context/BMapContext';
import type { BMapDriver } from '../drivers/types';

/** 拿 driver（可能为 null，未就绪时） */
export function useDriver(): BMapDriver | null {
  return useBMapContext().driver;
}
