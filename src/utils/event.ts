import type { BMapEvent } from '../types';

/**
 * 把 SDK 原始事件包装成统一 BMapEvent。
 * raw 字段始终保留原始事件对象。
 */
export function wrapEvent<T = unknown>(raw: T, target: unknown = null): BMapEvent<T> {
  const r = raw as Record<string, unknown> | null;
  return {
    type: (r?.type as string) ?? 'unknown',
    target: target as BMapEvent['target'],
    point: (r?.point ?? r?.latLng ?? undefined) as BMapEvent['point'],
    pixel: (r?.pixel ?? undefined) as BMapEvent['pixel'],
    overlay: (r?.overlay ?? undefined) as BMapEvent['overlay'],
    raw,
  };
}
