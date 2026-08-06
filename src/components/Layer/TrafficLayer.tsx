/**
 * TrafficLayer — 路况图层（手写组件，继承 TileLayer）。
 *
 * 组件方式：
 * ```tsx
 * <TrafficLayer autoRefresh refreshInterval={300000} colors={['#00ff00', ...]} edge />
 * ```
 *
 * 实现要点：
 * - mount → driver.createTrafficLayer + addLayer
 * - unmount → removeLayer
 * - autoRefresh / refreshInterval 变化 → 重建
 * - colors 变化 → raw.setColors()
 * - edge 变化 → raw.setEdge()
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';

export interface TrafficLayerOptions {
  /** v3: 预测日期 */
  predictDate?: { weekday: number; hour: number };
  /** v4: 是否自动刷新路况数据 */
  autoRefresh?: boolean;
  /** v4: 路况自动刷新间隔，单位毫秒 */
  refreshInterval?: number;
}

export interface TrafficLayerProps extends TrafficLayerOptions {
  /** v4+: 路况颜色 [畅通, 缓行, 拥堵, 严重拥堵] */
  colors?: string[];
  /** v4+: 是否显示白边 */
  edge?: boolean;
}

export const TrafficLayer = memo(function TrafficLayer(props: TrafficLayerProps) {
  const { autoRefresh, refreshInterval, colors, edge, predictDate } = props;
  const { map, driver } = useMapContext();
  const rawRef = useRef<any>(null);

  // create + add（constructor 选项变化时重建）
  const ctorKey = `${autoRefresh ?? ''}|${refreshInterval ?? ''}|${JSON.stringify(predictDate ?? '')}`;
  useLayoutEffect(() => {
    if (!map || !driver) return;
    const opts: Record<string, unknown> = {};
    if (autoRefresh !== undefined) opts.autoRefresh = autoRefresh;
    if (refreshInterval !== undefined) opts.refreshInterval = refreshInterval;
    if (predictDate !== undefined) opts.predictDate = predictDate;
    const handle = driver.createTrafficLayer(opts);
    if (!handle) return;
    rawRef.current = (handle as any).raw;
    driver.addLayer(map, handle);
    return () => {
      driver.removeLayer(map, handle);
      rawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // setColors
  const colorsKey = colors?.join(',');
  useEffect(() => {
    if (!rawRef.current || !colors) return;
    try { rawRef.current.setColors?.(colors); } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorsKey]);

  // setEdge
  useEffect(() => {
    if (!rawRef.current || edge === undefined) return;
    try { rawRef.current.setEdge?.(edge); } catch { /* noop */ }
  }, [edge]);

  return null;
});
