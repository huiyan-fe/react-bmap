import type { Point } from '../types';

/**
 * 经纬度误差容忍比较，避免浮点误差导致受控循环。
 */
export function pointEquals(a: Point | null | undefined, b: Point | null | undefined, eps = 1e-7): boolean {
  if (!a || !b) return a === b;
  return Math.abs(a.lng - b.lng) <= eps && Math.abs(a.lat - b.lat) <= eps;
}

export function pointToPlain(p: unknown): Point | null {
  if (!p) return null;
  const r = p as { lng?: number; lat?: number };
  if (typeof r.lng !== 'number' || typeof r.lat !== 'number') return null;
  return { lng: r.lng, lat: r.lat };
}
