// ──────────────────────────────────────────────────────────────
// react-bmap 主入口 — 全量导出
// ──────────────────────────────────────────────────────────────

// Provider
export { BMapProvider } from './provider/BMapProvider';
export type { BMapProviderProps } from './provider/BMapProvider';

// ─── SDK 常量 ───
export {
  BMAP_ANCHOR_TOP_LEFT, BMAP_ANCHOR_TOP_RIGHT, BMAP_ANCHOR_BOTTOM_LEFT, BMAP_ANCHOR_BOTTOM_RIGHT,
  BMAP_ANCHOR_TOP_CENTER, BMAP_ANCHOR_MIDDLE_LEFT, BMAP_ANCHOR_CENTER, BMAP_ANCHOR_MIDDLE_RIGHT,
  BMAP_ANCHOR_BOTTOM_CENTER,
  BMAP_STATUS_SUCCESS, BMAP_STATUS_CITY_LIST, BMAP_STATUS_UNKNOWN_LOCATION, BMAP_STATUS_UNKNOWN_ROUTE,
  BMAP_STATUS_INVALID_KEY, BMAP_STATUS_INVALID_REQUEST, BMAP_STATUS_PERMISSION_DENIED,
  BMAP_STATUS_SERVICE_UNAVAILABLE, BMAP_STATUS_TIMEOUT,
  BMAP_DRIVING_POLICY_DEFAULT, BMAP_DRIVING_POLICY_DESTANCE, BMAP_DRIVING_POLICY_AVOID_HIGHWAYS,
  BMAP_DRIVING_POLICY_FIRST_HIGHWAYS, BMAP_DRIVING_POLICY_AVOID_CONGESTION, BMAP_DRIVING_POLICY_AVOID_PAY,
  BMAP_DRIVING_POLICY_HIGHWAYS_AVOID_CONGESTION, BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_CONGESTION,
  BMAP_DRIVING_POLICY_AVOID_CONGESTION_PAY, BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_CONGESTION_PAY,
  BMAP_DRIVING_POLICY_AVOID_HIGHWAYS_PAY, BMAP_DRIVING_POLICY_DISTANCE_PRIORITY, BMAP_DRIVING_POLICY_TIME_PRIORITY,
  BMAP_TRANSIT_POLICY_RECOMMEND, BMAP_TRANSIT_POLICY_LEAST_TRANSFER, BMAP_TRANSIT_POLICY_LEAST_WALKING,
  BMAP_TRANSIT_POLICY_AVOID_SUBWAYS, BMAP_TRANSIT_POLICY_LEAST_TIME, BMAP_TRANSIT_POLICY_FIRST_SUBWAYS,
  BMAP_NORMAL_MAP, BMAP_PERSPECTIVE_MAP, BMAP_SATELLITE_MAP, BMAP_HYBRID_MAP,
  BMAP_ANIMATION_BOUNCE, BMAP_ANIMATION_DROP,
  BMAP_UNIT_METRIC, BMAP_UNIT_IMPERIAL,
  BMAP_LANG_CN, BMAP_LANG_EN,
  BMAP_NAVIGATION_CONTROL_LARGE, BMAP_NAVIGATION_CONTROL_SMALL, BMAP_NAVIGATION_CONTROL_PAN, BMAP_NAVIGATION_CONTROL_ZOOM,
  BMAP_MAPTYPE_CONTROL_HORIZONTAL, BMAP_MAPTYPE_CONTROL_DROPDOWN, BMAP_MAPTYPE_CONTROL_MAP,
  BMAP_SHAPE_CIRCLE, BMAP_SHAPE_RECTANGLE,
  getSdkConstant,
} from './const';
export type { ControlAnchor, ServiceStatus, DrivingPolicy, TransitPolicy, MapType, Animation, LengthUnit, Language, NavigationControlType, MapTypeControlType, ShapeType } from './const';
// SymbolShapeType 来自 constants（正确的 1-14 范围，非 const 中的旧 0-8）
export type { SymbolShapeType } from './constants';

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

// ─── Overlay 组件（18 个） ───
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
export { PlaceDetailPanel } from './components/Overlay/PlaceDetailPanel';
export type { PlaceDetailProps, PlaceDetailOptions, PlaceDetailRenderOptions } from './components/Overlay';
export type { PlaceDetailPanelProps } from './components/Overlay/PlaceDetailPanel';
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
export { Marker3D, MapMask, SimpleInfoWindow } from './components/Overlay';
export type { Marker3DProps, Marker3DOptions, MapMaskProps, MapMaskOptions, SimpleInfoWindowProps, SimpleInfoWindowOptions } from './components/Overlay';

// Overlay Options 类型（给用户精确类型）
export type {
  MarkerOptions, LabelOptions, PolylineOptions, PolygonOptions, CircleOptions,
  RectangleOptions, BezierCurveOptions, PrismOptions, GroundOverlayOptions,
  GroundPointOptions, PointCollectionOptions, InfoWindowOptions, SymbolOptions,
  IconOptions, HotspotOptions, CustomOverlayOptions,
  OverlayReactProps, PlainIcon, SymbolIcon,
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
  NavigationControlOptions, NavigationControl3DOptions, ScaleControlOptions,
  OverviewMapControlOptions, MapTypeControlOptions, CopyrightControlOptions,
  GeolocationControlOptions, PanoramaControlOptions, ZoomControlOptions,
  CityListControlOptions, LocationControlOptions, LogoControlOptions,
  CopyrightItem,
} from './components/Control';

// ─── Layer 组件（18 个） ───
export {
  TileLayer, NormalLayer, GeoJSONLayer, DistrictLayer,
  TrafficLayer, CustomLayer, CanvasLayer,
  RasterTileLayer, WMSLayer, WMTSLayer, XYZLayer, MVTLayer,
  FeatureLayer, FillLayer, DOMLayer, PointIconLayer, PointShapeLayer,
  PanoramaCoverageLayer,
  LineLayer, PixelLayer, BaiduLayer, ThreeLayer,
} from './components/Layer';
export type {
  TileLayerProps, NormalLayerProps, GeoJSONLayerProps, DistrictLayerProps,
  TrafficLayerProps, CustomLayerProps, CanvasLayerProps,
  RasterTileLayerProps, WMSLayerProps, WMTSLayerProps, XYZLayerProps, MVTLayerProps,
  FeatureLayerProps, FillLayerProps, DOMLayerProps, PointIconLayerProps, PointShapeLayerProps,
  PanoramaCoverageLayerProps,
  LineLayerProps, PixelLayerProps, BaiduLayerProps, ThreeLayerProps,
} from './components/Layer';
export type {
  TileLayerOptions, NormalLayerOptions, GeoJSONLayerOptions, DistrictLayerOptions,
  TrafficLayerOptions, CustomLayerOptions, CanvasLayerOptions,
  RasterTileLayerOptions, WMSLayerOptions, WMTSLayerOptions, XYZLayerOptions, MVTLayerOptions,
  FeatureLayerOptions, FillLayerOptions, DOMLayerOptions, PointIconLayerOptions, PointShapeLayerOptions,
  LineLayerOptions, PixelLayerOptions, BaiduLayerOptions, ThreeLayerOptions,
  FillLayerStyle, PointIconStyle, PointShapeStyle,
} from './components/Layer';
// ThreeLayer 的命令式句柄与生命周期回调类型
export type { ThreeLayerRef, ThreeLayerInstance, ThreeLayerHook, ThreeObject } from './components/Layer';

// ─── ContextMenu + MenuItem ───
export { ContextMenu, MenuItem } from './components/Menu';
export type { ContextMenuProps, MenuItemProps } from './components/Menu';

// ─── Panorama + PanoramaLabel ───
export { Panorama, PanoramaLabel } from './components/Panorama';
export type { PanoramaProps, PanoramaLabelProps } from './components/Panorama';

// ─── Hooks ───
export { useMap } from './hooks/useMap';
export { useDriver } from './hooks/useDriver';
export { CAPABILITY_MATRIX } from './drivers/capabilityMatrix';
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
  useLocalSearch,
  useGeocoder, useDrivingRoute, useWalkingRoute,
  useRidingRoute, useTransitRoute, useBusLineSearch, useAutocomplete,
  useBoundary, useGeolocation, useLocalCity, usePlaceDetail, useConvertor,
  usePanoramaService, useTruckRoute,
} from './hooks/services';
export type {
  LocalSearchOptions, LocalSearchHookResult, LocalSearchRenderOptions,
  DrivingRouteOptions, DrivingRouteHookResult,
  TransitRouteOptions, TransitRouteHookResult,
  WalkingRouteOptions, WalkingRouteHookResult,
  RidingRouteOptions, RidingRouteHookResult,
  BusLineSearchOptions, BusLineSearchHookResult,
  AutocompleteOptions, AutocompleteHookResult,
  GeocoderHookResult,
  BoundaryHookResult,
  LocalCityHookResult,
  ConvertorHookResult,
  GeolocationHookResult,
  PanoramaServiceHookResult,
  PlaceDetailHookResult,
  TruckRouteOptions, TruckRouteHookResult,
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
  MapMouseEvent, MapMoveEvent, MapZoomEvent, MapEvent,
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
  BoundaryResult,
  TaxiFare, TaxiFareDetail, PanoramaData,
  RenderOptions,
} from './types/results';

// ─── 常量（全量 28 组） ───
export * from './constants';
