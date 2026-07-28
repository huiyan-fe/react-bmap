import { useMapContext } from '../context/MapContext';
import type { MapHandle } from '../types';

/** 拿 MapHandle（可能为 null，子组件条件渲染用） */
export function useMap(): MapHandle | null {
  return useMapContext().map;
}
