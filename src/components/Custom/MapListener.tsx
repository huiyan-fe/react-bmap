import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';

export const MapListenerPropsSchema = z.object({
  onZoomend: z.any().optional().describe('缩放结束回调'),
  onDragend: z.any().optional().describe('拖拽结束回调'),
  eventType: z.enum(['debounce', 'throttle', 'direct']).optional().describe('事件处理方式'),
  delay: z.number().optional().describe('防抖/节流延迟(ms)'),
  map: z.any().optional(),
});

export type MapListenerProps = z.infer<typeof MapListenerPropsSchema>;

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

function throttle<T extends (...args: any[]) => any>(fn: T, mustRunDelay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let start: number | undefined;
  const loop = (...args: Parameters<T>) => {
    const now = Date.now();
    if (!start) start = now;
    if (timer) clearTimeout(timer);
    if (now - start >= mustRunDelay) {
      fn(...args);
      start = now;
    } else {
      timer = setTimeout(() => loop(...args), 50);
    }
  };
  return loop as T;
}

export const MapListener: React.FC<MapListenerProps> = (props) => {
  const { map } = useBMap();
  const zoomendRef = useRef<((e: any) => void) | null>(null);
  const dragendRef = useRef<((e: any) => void) | null>(null);

  useEffect(() => {
    if (!map) return;

    const { eventType = 'debounce', delay = 500 } = props;

    const wrap = (fn: (e: any) => void) => {
      if (eventType === 'debounce') return debounce(fn, delay);
      if (eventType === 'throttle') return throttle(fn, delay);
      return fn;
    };

    if (props.onZoomend) {
      const handler = wrap(props.onZoomend);
      zoomendRef.current = handler;
      map.addEventListener('zoomend', handler);
    }
    if (props.onDragend) {
      const handler = wrap(props.onDragend);
      dragendRef.current = handler;
      map.addEventListener('dragend', handler);
    }

    return () => {
      if (zoomendRef.current) map.removeEventListener?.('zoomend', zoomendRef.current);
      if (dragendRef.current) map.removeEventListener?.('dragend', dragendRef.current);
    };
  }, [map, props.onZoomend, props.onDragend, props.eventType, props.delay]);

  return null;
};

export default MapListener;
