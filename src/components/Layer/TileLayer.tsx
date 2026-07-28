import { memo, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import type { TileLayerOptions } from './types';

export interface TileLayerProps extends TileLayerOptions {}

/**
 * TileLayer — 图层示例组件（DESIGN.md §5.3）。
 *
 * mount→addLayer、unmount→removeLayer、props 变化→重建图层（瓦片 url 等核心字段切换需重建）。
 * 图层能力不支持时 driver.createTileLayer 返回 null，组件渲染 null。
 */
export const TileLayer = memo(function TileLayer(props: TileLayerProps) {
  const { tileUrlTemplate, transparentPng, zIndex, opacity, boundary, retry, retryTime } = props;
  const { map, driver } = useMapContext();
  const layerRef = useRef<unknown>(null);

  useLayoutEffect(() => {
    if (!map || !driver) return;

    const handle = driver.createTileLayer({
      tileUrlTemplate, transparentPng, zIndex, opacity, boundary, retry, retryTime,
    });
    if (!handle) return;
    layerRef.current = handle;
    driver.addLayer(map, handle);

    return () => {
      driver.removeLayer(map, handle);
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver]);

  return null;
});
