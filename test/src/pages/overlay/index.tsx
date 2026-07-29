/**
 * 覆盖物独立测试页（17 个）。
 * Marker 使用手写完整页，其余使用模板。
 */
export { MarkerPage } from './MarkerPage';
export { LabelPage } from './LabelPage';
export { PolylinePage } from './PolylinePage';
export { PolygonPage } from './PolygonPage';
export { CirclePage } from './CirclePage';
export { RectanglePage } from './RectanglePage';
export { BezierCurvePage } from './BezierCurvePage';
export { PrismPage } from './PrismPage';
export { GroundOverlayPage } from './GroundOverlayPage';

import { makeOverlayTestPage } from '../templates';
import {
  GroundPoint, PointCollection, InfoWindow, Symbol,
  Icon, IconSequence, Hotspot, CustomOverlay,
} from 'react-bmap';
import { BMap_Symbol_SHAPE_CIRCLE, BMAP_POINT_SIZE_NORMAL } from 'react-bmap';

const BEIJING = { lng: 116.404, lat: 39.915 };

export const GroundPointPage = makeOverlayTestPage({ name: 'GroundPoint', Component: GroundPoint, defaultProps: { point: BEIJING, url: 'https://lbsyun.baidu.com/jsdemo/demo/images/logo.png' } });
export const PointCollectionPage = makeOverlayTestPage({ name: 'PointCollection', Component: PointCollection, defaultProps: { points: Array.from({ length: 50 }, (_, i) => ({ lng: 116.40 + i * 0.001, lat: 39.91 + (i % 7) * 0.001 })), color: '#ff0000', size: BMAP_POINT_SIZE_NORMAL } });
export const InfoWindowPage = makeOverlayTestPage({ name: 'InfoWindow', Component: InfoWindow, defaultProps: { content: '<div>Hello</div>', title: '信息窗口' } });
export const SymbolPage = makeOverlayTestPage({ name: 'Symbol', Component: Symbol, defaultProps: { path: BMap_Symbol_SHAPE_CIRCLE, fillColor: '#ff0000', scale: 2 } });
export const IconPage = makeOverlayTestPage({ name: 'Icon', Component: Icon, defaultProps: { url: 'https://lbsyun.baidu.com/jsdemo/demo/images/logo.png', size: { width: 30, height: 30 } } });
export const IconSequencePage = makeOverlayTestPage({ name: 'IconSequence', Component: IconSequence, defaultProps: {} });
export const HotspotPage = makeOverlayTestPage({ name: 'Hotspot', Component: Hotspot, defaultProps: { position: BEIJING, text: '热区' } });
export const CustomOverlayPage = makeOverlayTestPage({ name: 'CustomOverlay', Component: CustomOverlay, defaultProps: { point: BEIJING } });
