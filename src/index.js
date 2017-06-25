/**
 * @file 入口主文件
 * @author kyle(hinikai@gmail.com)
 */

/**
 * 地图基础组件
 */
export {default as Map} from './components/map';
export {default as Marker} from './components/marker';
export {default as InfoWindow} from './components/infowindow';

/**
 * 地图控件组件
 */
export {default as NavigationControl} from './components/navigation-control';
export {default as OverviewMapControl} from './components/overview-map-control';
export {default as ScaleControl} from './components/scale-control';
export {default as MapTypeControl} from './components/map-type-control';

/**
 * 一些常用场景的组件
 */
export {default as Road} from './components/road';
export {default as Boundary} from './components/boundary';
export {default as MarkerOrder} from './components/marker-order';
export {default as MarkerList} from './components/marker-list';
export {default as MapvMarkerList} from './components/mapv-marker-list';
export {default as TrafficLayer} from './components/traffic-layer';

/**
 * 一些公用方法
 */
export {default as Merge} from './utils/merge';
