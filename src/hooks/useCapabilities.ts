import { useBMapContext } from '../context/BMapContext';
import type { Capability } from '../types';

/** 显式能力检测（可选用，driver 内部已自动处理） */
export function useCapabilities(): ReadonlySet<Capability> {
  const { driver } = useBMapContext();
  return driver?.capabilities ?? new Set<Capability>();
}
