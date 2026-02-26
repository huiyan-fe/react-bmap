import type { PointLike } from '../types';

export function createPoint(
  position: PointLike | [number, number] | { lng: number; lat: number },
  PointClass: new (lng: number, lat: number) => any
): any {
  if (Array.isArray(position)) {
    return new PointClass(position[0], position[1]);
  }
  return new PointClass(position.lng, position.lat);
}
