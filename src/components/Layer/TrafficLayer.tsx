import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';

const DEFAULT_TILES_URL = 'http://its.map.baidu.com/traffic/TrafficTileService';

export const TrafficLayerPropsSchema = z.object({
  tilesUrl: z.string().optional().describe('交通图层瓦片服务地址'),
  map: z.any().optional(),
});

export type TrafficLayerProps = z.infer<typeof TrafficLayerPropsSchema>;

export const TrafficLayer: React.FC<TrafficLayerProps> = (props) => {
  const { map, api: B } = useBMap();
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeTileLayer?.(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const tilesUrl = props.tilesUrl || DEFAULT_TILES_URL;
    const tileLayer = new B.TileLayer({ isTransparentPng: true } as any);
    let scaler = Math.round(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    scaler = Math.min(2, Math.max(1, scaler));
    (tileLayer as any).getTilesUrl = (tileCoord: any, zoom: number) => {
      const x = tileCoord.x;
      const y = tileCoord.y;
      const time = Date.now();
      return `${tilesUrl}?level=${zoom}&x=${x}&y=${y}&time=${time}&v=081&scaler=${scaler}`;
    };

    map.addTileLayer(tileLayer);
    tileLayerRef.current = tileLayer;

    return () => {
      map.removeTileLayer?.(tileLayerRef.current);
      tileLayerRef.current = null;
    };
  }, [map, props.tilesUrl]);

  return null;
};

export default TrafficLayer;
