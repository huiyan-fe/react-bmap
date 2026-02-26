import React, { createContext, useContext, useState, useCallback } from 'react';

export type MapMode = '2d' | 'gl';

const MapModeContext = createContext<{
  mode: MapMode;
  setMode: (mode: MapMode) => void;
} | null>(null);

export function MapModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<MapMode>('2d');
  const setMode = useCallback((m: MapMode) => setModeState(m), []);
  return (
    <MapModeContext.Provider value={{ mode, setMode }}>
      {children}
    </MapModeContext.Provider>
  );
}

export function useMapMode() {
  const ctx = useContext(MapModeContext);
  return ctx?.mode ?? '2d';
}

export function useSetMapMode() {
  const ctx = useContext(MapModeContext);
  return ctx?.setMode ?? (() => {});
}
