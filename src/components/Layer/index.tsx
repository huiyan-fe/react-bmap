/**
 * 全部 Layer 组件 — 使用 createLayerComponent 工厂批量生成。
 */
import { createLayerComponent } from '../../utils/createComponent';
import type { Point } from '../../types';

// Options 接口
export interface TileLayerOptions {
  transparentPng?: boolean; tileUrlTemplate?: string; zIndex?: number; copyright?: unknown;
  boundary?: string | string[]; opacity?: number; showRegion?: string; retry?: boolean; retryTime?: number; cacheSize?: number;
  tileLoadFunction?: (tile: HTMLImageElement, url: string) => void;
}
export interface NormalLayerOptions {
  visible?: boolean; opacity?: number; minZoom?: number; maxZoom?: number; zIndex?: number;
  enablePicked?: boolean; autoSelect?: boolean; popEvent?: boolean; isTop?: boolean; isLowText?: boolean;
  referCenter?: Point; pickWidth?: number; pickHeight?: number;
}
export interface GeoJSONLayerOptions {
  dataSource?: unknown; reference?: string;
  markerStyle?: unknown; polylineStyle?: unknown; polygonStyle?: unknown;
  minZoom?: number; maxZoom?: number; level?: number; visible?: boolean;
}
export interface DistrictLayerOptions {
  name?: string; adcode?: string; kind?: number; autoViewport?: boolean;
  strokeColor?: string; strokeWeight?: number; strokeOpacity?: number;
  fillColor?: string; fillOpacity?: number;
}
export interface CustomLayerOptions { databoxId?: string; geotableId?: string; q?: string; tags?: string; filter?: string; pointDensity?: number; }
export interface CanvasLayerOptions { zIndex?: number; paneName?: string; update?: Function; }

export type TileLayerProps = TileLayerOptions;
export type NormalLayerProps = NormalLayerOptions;
export type GeoJSONLayerProps = GeoJSONLayerOptions;
export type DistrictLayerProps = DistrictLayerOptions;
export type CustomLayerProps = CustomLayerOptions;
export type CanvasLayerProps = CanvasLayerOptions;

// 组件
export const TileLayer = createLayerComponent<TileLayerProps>({ displayName: 'TileLayer', factory: (d, p) => d.createTileLayer(p) });
export const NormalLayer = createLayerComponent<NormalLayerProps>({ displayName: 'NormalLayer', factory: (d, p) => d.createNormalLayer(p) });
export const GeoJSONLayer = createLayerComponent<GeoJSONLayerProps>({ displayName: 'GeoJSONLayer', factory: (d, p) => d.createGeoJSONLayer(p) });
export const DistrictLayer = createLayerComponent<DistrictLayerProps>({ displayName: 'DistrictLayer', factory: (d, p) => d.createDistrictLayer(p), reuseHandle: true, deferMount: true });
// TrafficLayer 是手写组件（支持 setColors / setEdge），见 TrafficLayer.tsx
export { TrafficLayer } from './TrafficLayer';
export type { TrafficLayerProps, TrafficLayerOptions } from './TrafficLayer';
export const CustomLayer = createLayerComponent<CustomLayerProps>({ displayName: 'CustomLayer', factory: (d, p) => d.createCustomLayer(p) });
export const CanvasLayer = createLayerComponent<CanvasLayerProps>({ displayName: 'CanvasLayer', factory: (d, p) => d.createCanvasLayer(p) });

// ─── 高级图层（4.0+） ───

// RasterTileLayer — 栅格瓦片图层
export interface RasterTileLayerOptions {
  url: string | ((x: number, y: number, z: number) => string);
  subdomains?: string[];
  projection?: string;
  bounds?: number[];
  boundsInWGS84?: boolean;
  minZoom?: number;
  maxZoom?: number;
  spanLevel?: number;
  opacity?: number;
  zIndex?: number;
  useThumbData?: boolean;
  boundary?: string | string[];
  showRegion?: 'inside' | 'outside';
  height?: number;
  retry?: boolean;
  retryTime?: number;
  cacheSize?: number;
  tileLoadFunction?: (tile: HTMLImageElement, url: string) => void;
}
export type RasterTileLayerProps = RasterTileLayerOptions;

// WMSLayer — WMS 标准服务图层
export interface WMSLayerOptions {
  url?: string;
  params?: Record<string, string>;
  projection?: string;
  tileSize?: number;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  extent?: number[];
  extentCRSIsWGS84?: boolean;
  useThumbData?: boolean;
  spanLevel?: number;
  reproject?: boolean;
  reprojectSourceCRS?: string;
  png8?: boolean;
  height?: number;
  retry?: boolean;
  retryTime?: number;
  dataType?: string;
  cacheSize?: number;
  boundary?: string[];
  thumbParentDepth?: number;
  thumbChildDepth?: number;
  tileLoadFunction?: (tile: HTMLImageElement, url: string) => void;
}
export type WMSLayerProps = WMSLayerOptions;

// WMTSLayer — WMTS 标准服务图层
export interface WMTSLayerOptions {
  url?: string;
  params?: Record<string, string>;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  extent?: number[];
  extentCRSIsWGS84?: boolean;
  transform?: { source?: string; target?: string };
  xTemplate?: (x: number, y: number, z: number) => number | string;
  yTemplate?: (x: number, y: number, z: number) => number | string;
  zTemplate?: (x: number, y: number, z: number) => number | string;
  useThumbData?: boolean;
  spanLevel?: number;
  reproject?: boolean;
  reprojectSourceCRS?: string;
  png8?: boolean;
  height?: number;
  retry?: boolean;
  retryTime?: number;
  dataType?: string;
  cacheSize?: number;
  boundary?: string[];
  thumbParentDepth?: number;
  thumbChildDepth?: number;
  tileLoadFunction?: (tile: HTMLImageElement, url: string) => void;
}
export type WMTSLayerProps = WMTSLayerOptions;

// XYZLayer — XYZ 瓦片图层
export interface XYZLayerOptions {
  tileUrlTemplate?: string;
  xTemplate?: (x: number, y: number, z: number) => number | string;
  yTemplate?: (x: number, y: number, z: number) => number | string;
  zTemplate?: (x: number, y: number, z: number) => number | string;
  bTemplate?: (x: number, y: number, z: number) => string;
  minZoom?: number;
  maxZoom?: number;
  extent?: number[];
  extentCRSIsWGS84?: boolean;
  boundary?: string[];
  useThumbData?: boolean;
  tms?: boolean;
  opacity?: number;
  zIndex?: number;
}
export type XYZLayerProps = XYZLayerOptions;

// MVTLayer — MVT 矢量瓦片图层
export interface MVTLayerOptions {
  tileUrlTemplate?: string;
  transform?: { source?: string; target?: string };
  gridModel?: number;
  spanLevel?: number;
  noCollision?: boolean;
  useThumb?: boolean;
  minZoom?: number;
  maxZoom?: number;
  encrypt?: boolean;
  idProperty?: string;
  layers?: unknown[];
  style?: unknown;
  onclick?: (e: unknown) => void;
  ondblclick?: (e: unknown) => void;
  onmousemove?: (e: unknown) => void;
  onmouseout?: (e: unknown) => void;
}
export type MVTLayerProps = MVTLayerOptions;

// FeatureLayer — 手写组件，见 FeatureLayer.tsx

// FillLayer — 手写组件，见 FillLayer.tsx

// DOMLayer — 手写组件，见 DOMLayer.tsx

// PointIconLayer — 手写组件，见 PointIconLayer.tsx

// PointShapeLayer — 手写组件，见 PointShapeLayer.tsx

// PanoramaCoverageLayer — 全景覆盖图层
export type PanoramaCoverageLayerProps = Record<string, never>;

export const RasterTileLayer = createLayerComponent<RasterTileLayerProps>({ displayName: 'RasterTileLayer', factory: (d, p) => d.createRasterTileLayer(p) });
export const WMSLayer = createLayerComponent<WMSLayerProps>({ displayName: 'WMSLayer', factory: (d, p) => d.createWMSLayer(p) });
export const WMTSLayer = createLayerComponent<WMTSLayerProps>({ displayName: 'WMTSLayer', factory: (d, p) => d.createWMTSLayer(p) });
export const XYZLayer = createLayerComponent<XYZLayerProps>({ displayName: 'XYZLayer', factory: (d, p) => d.createXYZLayer(p) });
export const MVTLayer = createLayerComponent<MVTLayerProps>({
  displayName: 'MVTLayer',
  factory: (d, p) => d.createMVTLayer(p),
  events: [
    { sdk: 'click', prop: 'onclick' },
    { sdk: 'dblclick', prop: 'ondblclick' },
    { sdk: 'mousemove', prop: 'onmousemove' },
    { sdk: 'mouseout', prop: 'onmouseout' },
  ],
});
// FeatureLayer 是手写组件（支持 setData），见 FeatureLayer.tsx
export { FeatureLayer } from './FeatureLayer';
export type { FeatureLayerProps, FeatureLayerOptions } from './FeatureLayer';
// FillLayer — 手写组件（支持 setData / setStyleOptions），见 FillLayer.tsx
export { FillLayer } from './FillLayer';
export type { FillLayerProps, FillLayerOptions, FillLayerStyle } from './FillLayer';
// DOMLayer — 手写组件（支持 createDOM + setData），见 DOMLayer.tsx
export { DOMLayer } from './DOMLayer';
export type { DOMLayerProps, DOMLayerOptions } from './DOMLayer';
// PointIconLayer — 手写组件（支持 setData），见 PointIconLayer.tsx
export { PointIconLayer } from './PointIconLayer';
export type { PointIconLayerProps, PointIconLayerOptions, PointIconStyle } from './PointIconLayer';
// PointShapeLayer — 手写组件（支持 setData），见 PointShapeLayer.tsx
export { PointShapeLayer } from './PointShapeLayer';
export type { PointShapeLayerProps, PointShapeLayerOptions, PointShapeStyle } from './PointShapeLayer';
export const PanoramaCoverageLayer = createLayerComponent<PanoramaCoverageLayerProps>({ displayName: 'PanoramaCoverageLayer', factory: (d) => d.createPanoramaCoverageLayer({}) });

// ─── 4.0+ 额外图层（SDK 运行时存在，dts 无完整定义） ───

// LineLayer — 线图层（继承 NormalLayer）
export interface LineLayerOptions {
  style?: unknown;
  idKey?: string;
  crs?: string;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
  enablePicked?: boolean;
}
export type LineLayerProps = LineLayerOptions;
export const LineLayer = createLayerComponent<LineLayerProps>({ displayName: 'LineLayer', factory: (d, p) => d.createLineLayer(p) });

// PixelLayer — 像素图层
export interface PixelLayerOptions {
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
}
export type PixelLayerProps = PixelLayerOptions;
// v4 SDK 已废弃 addTileLayer/removeTileLayer（控制台会打 deprecated 警告），瓦片类图层
// 统一走 addLayer/removeLayer；v3 下 driver.addLayer 会自己分派回 addTileLayer。
export const PixelLayer = createLayerComponent<PixelLayerProps>({ displayName: 'PixelLayer', factory: (d, p) => d.createPixelLayer(p) });

// BaiduLayer — 百度图层
export interface BaiduLayerOptions {
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  zIndex?: number;
}
export type BaiduLayerProps = BaiduLayerOptions;
export const BaiduLayer = createLayerComponent<BaiduLayerProps>({ displayName: 'BaiduLayer', factory: (d, p) => d.createBaiduLayer(p) });

// ThreeLayer — 手写组件（ctorKey 只含 alpha/antialias，其余走 setter；带 ref 句柄），见 ThreeLayer.tsx
export { ThreeLayer } from './ThreeLayer';
export type {
  ThreeLayerProps, ThreeLayerOptions, ThreeLayerRef, ThreeLayerInstance, ThreeLayerHook, ThreeObject,
} from './ThreeLayer';
