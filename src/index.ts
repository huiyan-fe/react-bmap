// ──────────────────────────────────────────────────────────────
// react-bmap 主入口 — 全量导出
// ──────────────────────────────────────────────────────────────

// Provider
export { BMapProvider } from './provider/BMapProvider';
export type { BMapProviderProps } from './provider/BMapProvider';

// Context Hook（高级用法）
export { useBMapContext } from './context/BMapContext';
export type { BMapContextValue } from './context/BMapContext';
export { useMapContext } from './context/MapContext';
export type { MapContextValue } from './context/MapContext';
export { useOverlayTarget } from './context/OverlayTargetContext';
export type { OverlayTargetContextValue } from './context/OverlayTargetContext';

// Map 容器
export { Map } from './components/Map';
export type { MapProps } from './components/Map';
export type { MapRef } from './components/Map';

// ─── Overlay 组件（16 个） ───
export { Marker } from './components/Overlay';
export type { MarkerProps } from './components/Overlay';
export { Label } from './components/Overlay';
export type { LabelProps } from './components/Overlay';
export { Polyline } from './components/Overlay';
export type { PolylineProps } from './components/Overlay';
export { Polygon } from './components/Overlay';
export type { PolygonProps } from './components/Overlay';
export { Circle } from './components/Overlay';
export type { CircleProps } from './components/Overlay';
export { Rectangle } from './components/Overlay';
export type { RectangleProps } from './components/Overlay';
export { BezierCurve } from './components/Overlay';
export type { BezierCurveProps } from './components/Overlay';
export { Prism } from './components/Overlay';
export type { PrismProps } from './components/Overlay';
export { GroundOverlay } from './components/Overlay';
export type { GroundOverlayProps } from './components/Overlay';
export { GroundPoint } from './components/Overlay';
export type { GroundPointProps } from './components/Overlay';
export { PointCollection } from './components/Overlay';
export type { PointCollectionProps } from './components/Overlay';
export { InfoWindow } from './components/Overlay';
export type { InfoWindowProps } from './components/Overlay';
export { PlaceDetail } from './components/Overlay';
export type { PlaceDetailProps, PlaceDetailOptions, PlaceDetailRenderOptions } from './components/Overlay';
export { Symbol } from './components/Overlay';
export type { SymbolProps } from './components/Overlay';
export { Icon } from './components/Overlay';
export type { IconProps } from './components/Overlay';
export { IconSequence } from './components/Overlay';
export type { IconSequenceProps } from './components/Overlay';
export { Hotspot } from './components/Overlay';
export type { HotspotProps } from './components/Overlay';
export { CustomOverlay } from './components/Overlay';
export type { CustomOverlayProps } from './components/Overlay';

// Overlay Options 类型（给用户精确类型）
export type {
  MarkerOptions, LabelOptions, PolylineOptions, PolygonOptions, CircleOptions,
  RectangleOptions, BezierCurveOptions, PrismOptions, GroundOverlayOptions,
  GroundPointOptions, PointCollectionOptions, InfoWindowOptions, SymbolOptions,
  IconOptions, HotspotOptions, CustomOverlayOptions,
  OverlayReactProps, PlainIcon,
} from './components/Overlay/types';

// ─── Control 组件（12 个） ───
export {
  NavigationControl, NavigationControl3D, ScaleControl, OverviewMapControl,
  MapTypeControl, CopyrightControl, GeolocationControl, PanoramaControl,
  ZoomControl, CityListControl, LocationControl, LogoControl,
} from './components/Control';
export type {
  NavigationControlProps, NavigationControl3DProps, ScaleControlProps,
  OverviewMapControlProps, MapTypeControlProps, CopyrightControlProps,
  GeolocationControlProps, PanoramaControlProps, ZoomControlProps,
  CityListControlProps, LocationControlProps, LogoControlProps,
} from './components/Control';

// ─── Layer 组件（7 个） ───
export {
  TileLayer, NormalLayer, GeoJSONLayer, DistrictLayer,
  TrafficLayer, CustomLayer, CanvasLayer,
} from './components/Layer';
export type {
  TileLayerProps, NormalLayerProps, GeoJSONLayerProps, DistrictLayerProps,
  TrafficLayerProps, CustomLayerProps, CanvasLayerProps,
} from './components/Layer';

// ─── ContextMenu + MenuItem ───
export { ContextMenu, MenuItem } from './components/Menu';
export type { ContextMenuProps, MenuItemProps } from './components/Menu';

// ─── Panorama + PanoramaLabel ───
export { Panorama, PanoramaLabel } from './components/Panorama';
export type { PanoramaProps, PanoramaLabelProps } from './components/Panorama';

// ─── Hooks ───
export { useMap } from './hooks/useMap';
export { useDriver } from './hooks/useDriver';
export { useMapRef } from './hooks/useMapRef';
export { useCapabilities } from './hooks/useCapabilities';
export { useMapEvent } from './hooks/useMapEvent';
export { useMapStatus } from './hooks/useMapStatus';
export type { MapSnapshot } from './hooks/useMapStatus';

// ─── 值对象 Hooks（Symbol/Icon 等值对象，用作 Marker icon 参数） ───
export { useSymbol } from './hooks/useSymbol';
export { useIcon } from './hooks/useIcon';

// ─── Service Hooks（13 个） ───
export {
  useLocalSearch, useGeocoder, useDrivingRoute, useWalkingRoute,
  useRidingRoute, useTransitRoute, useBusLineSearch, useAutocomplete,
  useBoundary, useGeolocation, useLocalCity, usePlaceDetail, useConvertor,
  usePanoramaService,
} from './hooks/services';

// ─── Driver（高级用法） ───
export type { BMapDriver } from './drivers/types';
export { createDriver } from './drivers/createDriver';
export { UnsupportedCapabilityError, tryOp } from './drivers/unsupported';
export type { OpResult } from './drivers/unsupported';

// ─── 错误边界 ───
export { BMapErrorBoundary } from './errorBoundary/BMapErrorBoundary';

// ─── 核心类型 ───
export type {
  Point, Pixel, Size, Bounds,
  MapHandle, OverlayHandle, ControlHandle, LayerHandle, ServiceHandle,
  BMapVersion, UnsupportedBehavior, Capability, BMapEvent,
  LoadKeyComponents,
} from './types';

// ─── 核心扩展类型（DisplayOptions / Viewport / ViewAnimation 等） ───
export type {
  DisplayOptions, Viewport, ViewportOptions, MapStyleConfig,
  MapStyleV2Options, MapLabel, MapPanes,
  ViewAnimation, ViewAnimationKeyFrames, ViewAnimationOptions,
  Projection, PredictDate,
} from './types/core';

// ─── 服务结果类型 ───
export type {
  LocalResultPoi, LocalResult, AddressComponent, GeocoderResult,
  Step, Route, RoutePlan, DrivingRouteResult, WalkingRouteResult, RidingRouteResult,
  TransitLine, TransitPlan, TransitRouteResult,
  BusStation, BusLine, BusListItem, BusListResult,
  AutocompleteResultPoi, AutocompleteResult,
  GeolocationResult, LocalCityResult, TranslateResults,
  TaxiFare, TaxiFareDetail, PanoramaData,
  RenderOptions,
} from './types/results';

// ─── 高级图层组件（4.0+，11 个） ───
export {
  RasterTileLayer, WMSLayer, WMTSLayer, XYZLayer, MVTLayer,
  FeatureLayer, FillLayer, DOMLayer, PointIconLayer, PointShapeLayer,
  PanoramaCoverageLayer,
} from './components/Layer';
export type {
  RasterTileLayerProps, WMSLayerProps, WMTSLayerProps, XYZLayerProps, MVTLayerProps,
  FeatureLayerProps, FillLayerProps, DOMLayerProps, PointIconLayerProps, PointShapeLayerProps,
  PanoramaCoverageLayerProps,
} from './components/Layer';

// ─── 常量（全量 28 组） ───
export * from './constants';
