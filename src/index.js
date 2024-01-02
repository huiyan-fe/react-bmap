/**
 * @file 入口主文件
 * @author kyle(hinikai@gmail.com)
 */

/**
 * 地图基础组件
 */
export {default as Map} from './components/map';
export {default as Marker} from './components/marker';
export {default as MarkerOrderTip} from './components/marker-order-tip';
export {default as InfoWindow} from './components/infowindow';

/**
 * 地图控件组件
 */
export {default as NavigationControl} from './components/navigation-control';
export {default as OverviewMapControl} from './components/overview-map-control';
export {default as ScaleControl} from './components/scale-control';
export {default as MapTypeControl} from './components/map-type-control';
export {default as PanoramaControl} from './components/panorama-control';

/**
 * 图形覆盖物组件
 */
export {default as Circle} from './components/circle';
export {default as Polyline} from './components/polyline';
export {default as Polygon} from './components/polygon';

/**
 * 一些常用场景的组件
 */
export {default as Road} from './components/road';
export {default as Boundary} from './components/boundary';
export {default as MarkerList} from './components/marker-list';
export {default as MapvMarkerList} from './components/mapv-marker-list';
export {default as TrafficLayer} from './components/traffic-layer';

/**
 * 一些公用方法
 */
export {default as Merge} from './utils/merge';

/**
 * mapv和mapvgl图层
 */
export {default as MapvLayer} from './components/mapv-layer';
export {default as MapvglLayer} from './components/mapvgl-layer';
export {default as MapvglView} from './components/mapvgl-view';

/**
 * 服务组件
 */
export {default as DrivingRoute} from './components/driving-route';
export {default as WalkingRoute} from './components/walking-route';

/**
 * PointLabel组件
 */
export {default as PointLabel} from './components/point-label';

/**
 * Od迁徙组件
 */
export {default as Arc} from './components/arc';
export {default as ThickRay} from './components/thick-ray';

/**
 * 地图插件
 */
export {default as MapListener} from './components/map-listener';

/**
 * 输入提示
 */
export {default as Autocomplete} from './components/autocomplete';