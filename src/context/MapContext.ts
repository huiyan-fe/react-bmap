import { createContext, useContext } from 'react';
import type { MapHandle } from '../types';
import type { BMapDriver } from '../drivers/types';

export interface MapContextValue {
  map: MapHandle | null;
  driver: BMapDriver;
}

export const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error('[react-bmap] useMapContext must be used within <Map>');
  }
  return ctx;
}
