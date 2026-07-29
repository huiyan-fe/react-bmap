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
export { GroundPointPage } from './GroundPointPage';
export { PointCollectionPage } from './PointCollectionPage';
export { InfoWindowPage } from './InfoWindowPage';
export { SymbolPage } from './SymbolPage';
export { IconPage } from './IconPage';

import { makeOverlayTestPage } from '../templates';
import {
  IconSequence, Hotspot, CustomOverlay,
} from 'react-bmap';

const BEIJING = { lng: 116.404, lat: 39.915 };

export const IconSequencePage = makeOverlayTestPage({ name: 'IconSequence', Component: IconSequence, defaultProps: {} });
export const HotspotPage = makeOverlayTestPage({ name: 'Hotspot', Component: Hotspot, defaultProps: { position: BEIJING, text: '热区' } });
export const CustomOverlayPage = makeOverlayTestPage({ name: 'CustomOverlay', Component: CustomOverlay, defaultProps: { point: BEIJING } });
