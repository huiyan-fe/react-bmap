import type { Copyright } from './types-skd';

// 字段按 bmap-jsapi-dts src/layer/TileLayerOptions.d.ts
export interface TileLayerOptions {
  transparentPng?: boolean;
  tileUrlTemplate?: string;
  zIndex?: number;
  copyright?: Copyright;
  boundary?: string | string[];
  opacity?: number;
  showRegion?: string;
  retry?: boolean;
  retryTime?: number;
  cacheSize?: number;
}
