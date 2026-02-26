import { useEffect } from 'react';

export function useMapEvent(
  map: any,
  events: Record<string, ((...args: any[]) => void) | undefined> | undefined
) {
  useEffect(() => {
    if (!map || !events) return;
    const listeners: Array<{ event: string; handler: (...args: any[]) => void }> = [];
    for (const [event, handler] of Object.entries(events)) {
      if (handler && typeof handler === 'function') {
        const wrapped = (...args: any[]) => handler(...args);
        map.addEventListener(event, wrapped);
        listeners.push({ event, handler: wrapped });
      }
    }
    return () => {
      listeners.forEach(({ event, handler }) => map.removeEventListener?.(event, handler));
    };
  }, [map, events]);
}
