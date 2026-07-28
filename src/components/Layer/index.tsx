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
export interface TrafficLayerOptions { predictDate?: { weekday: number; hour: number }; }
export interface CustomLayerOptions { databoxId?: string; geotableId?: string; q?: string; tags?: string; filter?: string; pointDensityType?: number; }
export interface CanvasLayerOptions { zIndex?: number; paneName?: string; update?: Function; }

export type TileLayerProps = TileLayerOptions;
export type NormalLayerProps = NormalLayerOptions;
export type GeoJSONLayerProps = GeoJSONLayerOptions;
export type DistrictLayerProps = DistrictLayerOptions;
export type TrafficLayerProps = TrafficLayerOptions;
export type CustomLayerProps = CustomLayerOptions;
export type CanvasLayerProps = CanvasLayerOptions;

// 组件
export const TileLayer = createLayerComponent<TileLayerProps>({ displayName: 'TileLayer', factory: (d, p) => d.createTileLayer(p) });
export const NormalLayer = createLayerComponent<NormalLayerProps>({ displayName: 'NormalLayer', factory: (d, p) => d.createNormalLayer(p), addMethod: 'addNormalLayer', removeMethod: 'removeNormalLayer' });
export const GeoJSONLayer = createLayerComponent<GeoJSONLayerProps>({ displayName: 'GeoJSONLayer', factory: (d, p) => d.createGeoJSONLayer(p), addMethod: 'addGeoJSONLayer', removeMethod: 'removeGeoJSONLayer' });
export const DistrictLayer = createLayerComponent<DistrictLayerProps>({ displayName: 'DistrictLayer', factory: (d, p) => d.createDistrictLayer(p), addMethod: 'addDistrictLayer', removeMethod: 'removeDistrictLayer' });
export const TrafficLayer = createLayerComponent<TrafficLayerProps>({ displayName: 'TrafficLayer', factory: (d) => d.createTrafficLayer({}), addMethod: 'setTrafficOn', removeMethod: 'setTrafficOff' });
export const CustomLayer = createLayerComponent<CustomLayerProps>({ displayName: 'CustomLayer', factory: (d, p) => d.createCustomLayer(p) });
export const CanvasLayer = createLayerComponent<CanvasLayerProps>({ displayName: 'CanvasLayer', factory: (d, p) => d.createCanvasLayer(p) });

// ─── 高级图层（4.0+） ───
export type RasterTileLayerProps = TileLayerOptions & { urlTemplate?: string };
export type WMSLayerProps = { url?: string; layers?: string; format?: string; transparent?: boolean; opacity?: number; minZoom?: number; maxZoom?: number };
export type WMTSLayerProps = { url?: string; layer?: string; tilematrixset?: string; format?: string; transparent?: boolean; opacity?: number; minZoom?: number; maxZoom?: number };
export type XYZLayerProps = TileLayerOptions & { urlTemplate?: string; coordType?: string };
export type MVTLayerProps = { url?: string; minZoom?: number; maxZoom?: number; opacity?: number; visible?: boolean };
export type FeatureLayerProps = CustomLayerProps;
export type FillLayerProps = CustomLayerProps;
export type DOMLayerProps = { zIndex?: number; container?: HTMLElement };
export type PointIconLayerProps = CustomLayerProps;
export type PointShapeLayerProps = CustomLayerProps;
export type PanoramaCoverageLayerProps = Record<string, never>;

export const RasterTileLayer = createLayerComponent<RasterTileLayerProps>({ displayName: 'RasterTileLayer', factory: (d, p) => d.createRasterTileLayer(p) });
export const WMSLayer = createLayerComponent<WMSLayerProps>({ displayName: 'WMSLayer', factory: (d, p) => d.createWMSLayer(p) });
export const WMTSLayer = createLayerComponent<WMTSLayerProps>({ displayName: 'WMTSLayer', factory: (d, p) => d.createWMTSLayer(p) });
export const XYZLayer = createLayerComponent<XYZLayerProps>({ displayName: 'XYZLayer', factory: (d, p) => d.createXYZLayer(p) });
export const MVTLayer = createLayerComponent<MVTLayerProps>({ displayName: 'MVTLayer', factory: (d, p) => d.createMVTLayer(p) });
export const FeatureLayer = createLayerComponent<FeatureLayerProps>({ displayName: 'FeatureLayer', factory: (d, p) => d.createFeatureLayer(p) });
export const FillLayer = createLayerComponent<FillLayerProps>({ displayName: 'FillLayer', factory: (d, p) => d.createFillLayer(p) });
export const DOMLayer = createLayerComponent<DOMLayerProps>({ displayName: 'DOMLayer', factory: (d, p) => d.createDOMLayer(p) });
export const PointIconLayer = createLayerComponent<PointIconLayerProps>({ displayName: 'PointIconLayer', factory: (d, p) => d.createPointIconLayer(p) });
export const PointShapeLayer = createLayerComponent<PointShapeLayerProps>({ displayName: 'PointShapeLayer', factory: (d, p) => d.createPointShapeLayer(p) });
export const PanoramaCoverageLayer = createLayerComponent<PanoramaCoverageLayerProps>({ displayName: 'PanoramaCoverageLayer', factory: (d) => d.createPanoramaCoverageLayer({}) });
