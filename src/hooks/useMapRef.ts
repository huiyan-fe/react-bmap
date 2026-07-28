import { useMapContext } from '../context/MapContext';
import type { MapRef } from '../components/Map/MapRef';
import { MapRefImpl } from '../components/Map/MapRef';
import { useMemo } from 'react';

/** 命令式句柄（每次 map/driver 变化时重新生成） */
export function useMapRef(): MapRef | null {
  const { map, driver } = useMapContext();
  return useMemo(() => (map && driver ? new MapRefImpl(map, driver) : null), [map, driver]);
}
