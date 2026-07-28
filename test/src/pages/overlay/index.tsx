/**
 * 覆盖物独立测试页（17 个）。
 * Marker 使用手写完整页，其余使用模板。
 */
export { MarkerPage } from './MarkerPage';
export { LabelPage } from './LabelPage';

import { makeOverlayTestPage } from '../templates';
import {
  Polyline, Polygon, Circle, Rectangle, BezierCurve, Prism,
  GroundOverlay, GroundPoint, PointCollection, InfoWindow, Symbol,
  Icon, IconSequence, Hotspot, CustomOverlay,
} from 'react-bmap';
import { BMap_Symbol_SHAPE_CIRCLE, BMAP_POINT_SHAPE_CIRCLE, BMAP_POINT_SIZE_NORMAL } from 'react-bmap';

const BEIJING = { lng: 116.404, lat: 39.915 };
const PATH = [{ lng: 116.40, lat: 39.92 }, { lng: 116.42, lat: 39.91 }, { lng: 116.41, lat: 39.90 }];
const BOUNDS = { sw: { lng: 116.38, lat: 39.88 }, ne: { lng: 116.43, lat: 39.93 } };

export const PolylinePage = makeOverlayTestPage({ name: 'Polyline', Component: Polyline, defaultProps: { path: PATH, strokeColor: '#ff0000', strokeWeight: 4 } });
export const PolygonPage = makeOverlayTestPage({ name: 'Polygon', Component: Polygon, defaultProps: { path: PATH, strokeColor: '#0000ff', fillColor: '#0000ff55', strokeWeight: 3 } });
export const CirclePage = makeOverlayTestPage({ name: 'Circle', Component: Circle, defaultProps: { center: BEIJING, radius: 500, strokeColor: '#00aa00', fillColor: '#00aa0055' } });
export const RectanglePage = makeOverlayTestPage({ name: 'Rectangle', Component: Rectangle, defaultProps: { bounds: BOUNDS, strokeColor: '#ff8800', fillColor: '#ff880055' } });
export const BezierCurvePage = makeOverlayTestPage({ name: 'BezierCurve', Component: BezierCurve, defaultProps: { path: PATH, strokeColor: '#aa00ff', strokeWeight: 3 } });
export const PrismPage = makeOverlayTestPage({ name: 'Prism', Component: Prism, defaultProps: { path: PATH, topFillColor: '#1890ff' } });
export const GroundOverlayPage = makeOverlayTestPage({ name: 'GroundOverlay', Component: GroundOverlay, defaultProps: { bounds: BOUNDS, imageURL: 'https://lbsyun.baidu.com/jsdemo/demo/images/logo.png', opacity: 0.8 } });
export const GroundPointPage = makeOverlayTestPage({ name: 'GroundPoint', Component: GroundPoint, defaultProps: { point: BEIJING, url: 'https://lbsyun.baidu.com/jsdemo/demo/images/logo.png' } });
export const PointCollectionPage = makeOverlayTestPage({ name: 'PointCollection', Component: PointCollection, defaultProps: { points: Array.from({ length: 50 }, (_, i) => ({ lng: 116.40 + i * 0.001, lat: 39.91 + (i % 7) * 0.001 })), color: '#ff0000', size: BMAP_POINT_SIZE_NORMAL } });
export const InfoWindowPage = makeOverlayTestPage({ name: 'InfoWindow', Component: InfoWindow, defaultProps: { content: '<div>Hello</div>', title: '信息窗口' } });
export const SymbolPage = makeOverlayTestPage({ name: 'Symbol', Component: Symbol, defaultProps: { path: BMap_Symbol_SHAPE_CIRCLE, fillColor: '#ff0000', scale: 2 } });
export const IconPage = makeOverlayTestPage({ name: 'Icon', Component: Icon, defaultProps: { url: 'https://lbsyun.baidu.com/jsdemo/demo/images/logo.png', size: { width: 30, height: 30 } } });
export const IconSequencePage = makeOverlayTestPage({ name: 'IconSequence', Component: IconSequence, defaultProps: {} });
export const HotspotPage = makeOverlayTestPage({ name: 'Hotspot', Component: Hotspot, defaultProps: { position: BEIJING, text: '热区' } });
export const CustomOverlayPage = makeOverlayTestPage({ name: 'CustomOverlay', Component: CustomOverlay, defaultProps: { point: BEIJING } });
