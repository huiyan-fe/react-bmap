/**
 * 图层独立测试页（18 个）— 使用 makeLayerTestPage 模板生成。
 */
import { makeLayerTestPage } from '../templates';
import {
  TileLayer, NormalLayer, GeoJSONLayer, DistrictLayer, TrafficLayer, CustomLayer, CanvasLayer,
  RasterTileLayer, WMSLayer, WMTSLayer, XYZLayer, MVTLayer,
  FeatureLayer, FillLayer, DOMLayer, PointIconLayer, PointShapeLayer, PanoramaCoverageLayer,
} from 'react-bmap';

const TILE_URL = 'https://api.map.baidu.com/customimage/tile?&x={X}&y={Y}&z={Z}&styles=pl&udt=20150601';

export const TileLayerPage = makeLayerTestPage('TileLayer', TileLayer, { tileUrlTemplate: TILE_URL });
export const NormalLayerPage = makeLayerTestPage('NormalLayer', NormalLayer, { opacity: 0.5 });
export const GeoJSONLayerPage = makeLayerTestPage('GeoJSONLayer', GeoJSONLayer, { dataSource: {} });
export const DistrictLayerPage = makeLayerTestPage('DistrictLayer', DistrictLayer, { name: '北京市', strokeColor: '#1890ff', fillColor: '#1890ff33' });
export const TrafficLayerPage = makeLayerTestPage('TrafficLayer', TrafficLayer, {});
export const CustomLayerPage = makeLayerTestPage('CustomLayer', CustomLayer, {});
export const CanvasLayerPage = makeLayerTestPage('CanvasLayer', CanvasLayer, {});
export const RasterTileLayerPage = makeLayerTestPage('RasterTileLayer', RasterTileLayer, {});
export const WMSLayerPage = makeLayerTestPage('WMSLayer', WMSLayer, {});
export const WMTSLayerPage = makeLayerTestPage('WMTSLayer', WMTSLayer, {});
export const XYZLayerPage = makeLayerTestPage('XYZLayer', XYZLayer, {});
export const MVTLayerPage = makeLayerTestPage('MVTLayer', MVTLayer, {});
export const FeatureLayerPage = makeLayerTestPage('FeatureLayer', FeatureLayer, {});
export const FillLayerPage = makeLayerTestPage('FillLayer', FillLayer, {});
export const DOMLayerPage = makeLayerTestPage('DOMLayer', DOMLayer, {});
export const PointIconLayerPage = makeLayerTestPage('PointIconLayer', PointIconLayer, {});
export const PointShapeLayerPage = makeLayerTestPage('PointShapeLayer', PointShapeLayer, {});
export const PanoramaCoverageLayerPage = makeLayerTestPage('PanoramaCoverageLayer', PanoramaCoverageLayer, {});
