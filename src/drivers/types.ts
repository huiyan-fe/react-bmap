import type {
  BMapVersion,
  Capability,
  LayerKind,
  LoadKeyComponents,
  UnsupportedBehavior,
} from '../types';
import type {
  Bounds,
  ControlHandle,
  LayerHandle,
  MapHandle,
  OverlayHandle,
  Pixel,
  Point,
  ServiceHandle,
  Size,
} from '../types';

/**
 * BMapDriver 接口 — 完整覆盖 bmap-jsapi-dts 中 Map 类的全部公共方法。
 *
 * 分类（按 dts src/core/Map.d.ts 顺序）：
 * 1. Map 工厂 / 销毁
 * 2. 交互开关（enable/disable 系列）
 * 3. 视角控制（heading / tilt / rotate）
 * 4. 缩放级别（zoom / minZoom / maxZoom）
 * 5. 自动 resize
 * 6. 显示配置（displayOptions / setOptions）
 * 7. 容器信息（size / container）
 * 8. 坐标转换（point/pixel/mercator）
 * 9. 地图状态查询
 * 10. 地图标注 / Spots / 区域
 * 11. 视野控制（center / zoom / pan / flyTo / viewport）
 * 12. 地图类型
 * 13. 控件 / 右键菜单
 * 14. 覆盖物
 * 15. 图层（addLayer / addNormalLayer / addGeoJSONLayer / addDistrictLayer / traffic / tileLayer）
 * 16. 信息窗口
 * 17. 样式 / 主题
 * 18. 视角动画
 * 19. 截图 / 版权
 * 20. 地球模式 / 室内 / 街景 / 语言 / 私有 / 焦点遮罩 / 自定义 HTML 图层 / 停车场等
 * 21. 3.0-only（setPanorama / addHotspot / setCurrentCity / highResolution 等）
 * 22. Overlay/Control/Layer/Service/ContextMenu/Panorama 工厂与操作
 * 23. 事件
 *
 * 关键约定（DESIGN.md §12）：
 * - 工厂方法：不支持时返回 null 或 isNull: true 的 ServiceHandle。
 * - 命令方法：签名 void，不支持时按 unsupportedBehavior（throw / warn+noop / ignore+noop）。
 * - Getter：签名与 dts 一致；不支持时按 behavior：throw / warn+NaN或合理兜底 / ignore。
 * - **绝不污染原返回类型为 T | undefined**。
 */
export interface BMapDriver {
  readonly version: BMapVersion;
  readonly rawSDK: unknown;
  readonly capabilities: ReadonlySet<Capability>;
  readonly unsupportedBehavior: UnsupportedBehavior;

  // ─────────────── 1. Map 工厂 ───────────────
  createMap(container: HTMLElement, options: unknown): MapHandle;
  destroyMap(handle: MapHandle): void;

  // ─────────────── 2. 交互开关（成对） ───────────────
  enableDragging(map: MapHandle): void;
  disableDragging(map: MapHandle): void;
  enableInertialDragging(map: MapHandle): void;
  disableInertialDragging(map: MapHandle): void;
  enableScrollWheelZoom(map: MapHandle): void;
  disableScrollWheelZoom(map: MapHandle): void;
  enableContinuousZoom(map: MapHandle): void;
  disableContinuousZoom(map: MapHandle): void;
  enableResizeOnCenter(map: MapHandle): void;
  disableResizeOnCenter(map: MapHandle): void;
  enableDoubleClickZoom(map: MapHandle): void;
  disableDoubleClickZoom(map: MapHandle): void;
  enableKeyboard(map: MapHandle): void;
  disableKeyboard(map: MapHandle): void;
  enablePinchToZoom(map: MapHandle): void;
  disablePinchToZoom(map: MapHandle): void;
  enableRotate(map: MapHandle): void;
  disableRotate(map: MapHandle): void;
  enableRotateGestures(map: MapHandle): void;
  disableRotateGestures(map: MapHandle): void;
  enableTilt(map: MapHandle): void;
  disableTilt(map: MapHandle): void;
  enableTiltGestures(map: MapHandle): void;
  disableTiltGestures(map: MapHandle): void;
  enableAutoResize(map: MapHandle): void;
  disableAutoResize(map: MapHandle): void;

  // ─────────────── 3. 视角（4.0+） ───────────────
  setHeading(map: MapHandle, heading: number, options?: unknown): void;
  getHeading(map: MapHandle): number;
  setTilt(map: MapHandle, tilt: number, options?: unknown): void;
  getTilt(map: MapHandle): number;
  getCurrentMaxTilt(map: MapHandle): number;

  // ─────────────── 4. 缩放级别 ───────────────
  setMinZoom(map: MapHandle, zoom: number): void;
  setMaxZoom(map: MapHandle, zoom: number): void;
  getMinZoom(map: MapHandle): number;
  getMaxZoom(map: MapHandle): number;

  // ─────────────── 5. resize ───────────────
  checkResize(map: MapHandle): void;
  resize(map: MapHandle): void;

  // ─────────────── 6. 显示配置 ───────────────
  setDisplayOptions(map: MapHandle, options: unknown): void;
  setOptions(map: MapHandle, options: unknown): void;

  // ─────────────── 7. 容器信息 ───────────────
  getSize(map: MapHandle): Size;
  getContainerSize(map: MapHandle): Size;
  getZoomUnits(map: MapHandle): number;
  getContainer(map: MapHandle): HTMLElement;

  // ─────────────── 8. 坐标转换 ───────────────
  pixelToPoint(map: MapHandle, pixel: Pixel, options?: unknown): Point;
  pointToPixel(map: MapHandle, point: Point, options?: unknown): Pixel;
  lnglatToMercator(map: MapHandle, lng: number, lat: number): [number, number];
  mercatorToLnglat(map: MapHandle, mcLng: number, mcLat: number): [number, number];
  pointToOverlayPixel(map: MapHandle, point: Point, options?: unknown): Pixel;
  overlayPixelToPoint(map: MapHandle, pixel: Pixel, options?: unknown): Point;
  getDistance(map: MapHandle, start: Point, end: Point): number;

  // ─────────────── 9. 地图状态 ───────────────
  isLoaded(map: MapHandle): boolean;
  getCoordType(map: MapHandle): string;
  getMapTypeId(map: MapHandle): string;
  getMapCoordType(map: MapHandle): string;
  getMapStyleId(map: MapHandle): string;
  getAreaStyleId(map: MapHandle): string;
  getRenderType(map: MapHandle): string;
  isCanvasMap(map: MapHandle): boolean;
  getProjection(map: MapHandle): unknown;
  getExtendBounds(map: MapHandle, bounds: Bounds): Bounds;
  getSolarInfo(map: MapHandle, date: Date): unknown;
  getTileId(map: MapHandle, point: Point, level: number): string;
  getPoiByUid(map: MapHandle, uid: string, callback: (poi: unknown) => void): void;
  getPanes(map: MapHandle): unknown;
  getInfoWindow(map: MapHandle): OverlayHandle | null;

  // ─────────────── 10. 地图标注 / Spots（4.0+） ───────────────
  addSpots(map: MapHandle, spots: unknown[], options?: unknown): string;
  getSpots(map: MapHandle, id: string): unknown[];
  removeSpots(map: MapHandle, id: string): void;
  clearSpots(map: MapHandle): void;
  resetSpotStatus(map: MapHandle): void;
  hightlightSpotByUid(map: MapHandle, uid: string, tilePosStr: string): void;
  addAreaSpot(map: MapHandle, areaSpot: number[], options?: unknown): string;
  getAreaSpot(map: MapHandle, id: string): number[];
  removeAreaSpot(map: MapHandle, id: string): void;
  clearAreaSpots(map: MapHandle): void;
  clearLabels(map: MapHandle): void;
  addMapLabels(map: MapHandle, labels: unknown[]): string[];
  removeMapLabels(map: MapHandle, labelUids: string[]): void;
  getIconByClickPosition(map: MapHandle, clickPosition: Pixel): unknown | null;
  setBounds(map: MapHandle, bounds: Bounds): void;

  // ─────────────── 11. 视野控制 ───────────────
  centerAndZoom(map: MapHandle, center: Point | string, zoom?: number, options?: unknown): void;
  panTo(map: MapHandle, center: Point, options?: unknown): void;
  panBy(map: MapHandle, x: number, y: number, options?: unknown): void;
  flyTo(map: MapHandle, center: Point, zoom: number, options?: unknown): void;
  reset(map: MapHandle): void;
  setCenter(map: MapHandle, center: Point | string, options?: unknown): void;
  getCenter(map: MapHandle): Point;
  setViewport(map: MapHandle, view: Point[] | unknown, viewportOptions?: unknown): void;
  getViewport(map: MapHandle, view: Point[] | Bounds, viewportOptions?: unknown): unknown;
  setZoom(map: MapHandle, zoom: number, options?: unknown): void;
  getZoom(map: MapHandle): number;
  zoomIn(map: MapHandle, zoomCenter?: Point): void;
  zoomOut(map: MapHandle, zoomCenter?: Point): void;
  getBounds(map: MapHandle): Bounds;
  restrictBounds(map: MapHandle, bounds: Bounds | null): void;

  // ─────────────── 12. 地图类型 ───────────────
  setMapType(map: MapHandle, mapTypeId: string): void;
  getMapType(map: MapHandle): string;

  // ─────────────── 13. 控件 / 右键菜单 ───────────────
  addControl(map: MapHandle, control: ControlHandle): void;
  removeControl(map: MapHandle, control: ControlHandle): void;
  addContextMenu(map: MapHandle | OverlayHandle, menu: OverlayHandle): void;
  removeContextMenu(map: MapHandle | OverlayHandle, menu: OverlayHandle): void;

  // ─────────────── 14. 覆盖物 ───────────────
  addOverlay(map: MapHandle, overlay: OverlayHandle): void;
  removeOverlay(map: MapHandle, overlay: OverlayHandle): void;
  clearOverlays(map: MapHandle): void;
  getOverlays(map: MapHandle): OverlayHandle[];

  // ─────────────── 15. 图层 ───────────────
  addLayer(map: MapHandle, layer: LayerHandle): void;
  removeLayer(map: MapHandle, layer: LayerHandle): void;
  addTileLayer(map: MapHandle, layer: LayerHandle): void;
  removeTileLayer(map: MapHandle, layer: LayerHandle): void;
  getTileLayer(map: MapHandle, mapType: string): LayerHandle | null;
  addGeoJSONLayer(map: MapHandle, layer: LayerHandle): void;
  removeGeoJSONLayer(map: MapHandle, layer: LayerHandle): void;
  addDistrictLayer(map: MapHandle, layer: LayerHandle): void;
  removeDistrictLayer(map: MapHandle, layer: LayerHandle): void;
  addNormalLayer(map: MapHandle, layer: LayerHandle): void;
  removeNormalLayer(map: MapHandle, layer: LayerHandle): void;
  setTrafficOn(map: MapHandle): void;
  setTrafficOff(map: MapHandle): void;
  showOverlayContainer(map: MapHandle): void;
  hideOverlayContainer(map: MapHandle): void;

  // ─────────────── 16. 信息窗口 ───────────────
  openInfoWindow(map: MapHandle | OverlayHandle, iw: OverlayHandle, point?: Point): void;
  closeInfoWindow(map: MapHandle | OverlayHandle): void;

  // ─────────────── 17. 样式 / 主题 ───────────────
  setMapStyle(map: MapHandle, config: unknown): void;          // v1，3.0-only
  setMapStyleV2(map: MapHandle, options: unknown): void;       // v2，4.0+
  setTheme(map: MapHandle, theme: string, customVars?: Record<string, string>): void;
  setCopyrightOffset(map: MapHandle, logo: unknown, cpy: unknown): void;
  setDefaultCursor(map: MapHandle, cursor: string): void;
  getDefaultCursor(map: MapHandle): string;
  setDraggingCursor(map: MapHandle, cursor: string): void;
  getDraggingCursor(map: MapHandle): string;
  setOverlayMoveCursor(map: MapHandle, cursor: string): void;

  // ─────────────── 18. 视角动画 ───────────────
  startViewAnimation(map: MapHandle, viewAnimation: unknown): number;
  pauseViewAnimation(map: MapHandle, viewAnimation?: unknown): void;
  continueViewAnimation(map: MapHandle, viewAnimation?: unknown): void;
  cancelViewAnimation(map: MapHandle, viewAnimation?: unknown): void;

  // ─────────────── 19. 截图 ───────────────
  getScreenshot(map: MapHandle): string;

  // ─────────────── 20. 地球模式（4.0+） ───────────────
  isSupportEarth(map: MapHandle): boolean;
  getEarth(map: MapHandle): unknown;
  showEarthBoundary(map: MapHandle): void;
  hideEarthBoundary(map: MapHandle): void;
  setEarthMaxZoom(map: MapHandle, zoom: number): void;
  setEarthMinZoom(map: MapHandle, zoom: number): void;

  // ─────────────── 21. 室内（4.0+） ───────────────
  showIndoor(map: MapHandle, uid: string, floor: number): void;
  setIndoor(map: MapHandle, uid: string, floor: number): void;
  getIndoorInfo(map: MapHandle): unknown | null;

  // ─────────────── 22. 街景图层（4.0+） ───────────────
  showStreetLayer(map: MapHandle, show: boolean): void;
  hideStreetLayer(map: MapHandle): void;
  isStreetLayerShow(map: MapHandle): boolean;
  showVectorStreetLayer(map: MapHandle): void;
  hideVectorStreetLayer(map: MapHandle): void;

  // ─────────────── 23. 语言（4.0+） ───────────────
  getLanguage(map: MapHandle): string;
  changeLanguage(map: MapHandle, language: string): void;
  enablePreferredLanguage(map: MapHandle, language: string): void;
  disablePreferredLanguage(map: MapHandle): void;

  // ─────────────── 24. 私有 / 焦点遮罩 / 自定义 HTML 图层（4.0+） ───────────────
  setLock(map: MapHandle, lock: boolean): void;
  setPrivateRegions(map: MapHandle, regions: unknown[]): void;
  getPrivateRegions(map: MapHandle): unknown[];
  setPrivateStatus(map: MapHandle, isOn: boolean): void;
  getPrivateStatus(map: MapHandle): boolean;
  setCustomArea(map: MapHandle, config: unknown): void;
  addFocusMask(map: MapHandle, mask: unknown): void;
  removeFocusMask(map: MapHandle, mask: unknown): void;
  clearFocusMasks(map: MapHandle): void;
  addCustomHtmlLayer(map: MapHandle, layer: unknown): void;
  removeCustomHtmlLayer(map: MapHandle, layer: unknown): void;
  addParkingSpot(map: MapHandle, layer: unknown): void;
  removeParkingSpot(map: MapHandle, parking: unknown): void;

  // ─────────────── 25. 3.0-only ───────────────
  enableMapClick(map: MapHandle): void;
  disableMapClick(map: MapHandle): void;
  enable3DBuilding(map: MapHandle): void;
  disable3DBuilding(map: MapHandle): void;
  setPanorama(map: MapHandle, pano: unknown): void;
  getPanorama(map: MapHandle): unknown;
  setCurrentCity(map: MapHandle, city: string): void;
  highResolutionEnabled(map: MapHandle): boolean;
  addHotspot(map: MapHandle, hotspot: OverlayHandle): void;
  removeHotspot(map: MapHandle, hotspot: OverlayHandle): void;
  clearHotspots(map: MapHandle): void;

  // ─────────────── 26. Overlay 工厂（不支持返回 null） ───────────────
  createMarker(position: Point, options?: unknown): OverlayHandle | null;
  createLabel(content: unknown, options?: unknown): OverlayHandle | null;
  createPolyline(path: Point[], options?: unknown): OverlayHandle | null;
  createPolygon(path: Point[], options?: unknown): OverlayHandle | null;
  createCircle(center: Point, radius: number, options?: unknown): OverlayHandle | null;
  createRectangle(bounds: Bounds, options?: unknown): OverlayHandle | null;
  /** controlPoints 为 SDK 必填位置参数：每两个路径点之间 1~2 个控制点，组数 = path.length - 1 */
  createBezierCurve(path: Point[], controlPoints: Point[][], options?: unknown): OverlayHandle | null;
  /**
   * altitude 为 SDK 必填位置参数（棱柱高度，米）。
   * path 支持单坐标串 Point[] 或多坐标串 Point[][]（后者仅 constructor 支持，setPath 只接受单串）。
   */
  createPrism(path: Point[] | Point[][], altitude: number, options?: unknown): OverlayHandle | null;
  createGroundOverlay(bounds: Bounds, options?: unknown): OverlayHandle | null;
  createGroundPoint(point: Point, options?: unknown): OverlayHandle | null;
  createPointCollection(points: Point[], options?: unknown): OverlayHandle | null;
  createInfoWindow(content: unknown, options?: unknown): OverlayHandle | null;
  createSymbol(path: unknown, options?: unknown): OverlayHandle | null;
  createIcon(url: string, size: Size, options?: unknown): OverlayHandle | null;
  createIconSequence(symbol?: OverlayHandle, offset?: unknown, repeat?: string, fixedRotation?: boolean): OverlayHandle | null;
  createHotspot(position: Point, options?: unknown): OverlayHandle | null;
  createCustomOverlay(options: unknown): OverlayHandle | null;

  // ─────────────── 27. Overlay 属性 setter ───────────────
  setOverlayPosition(overlay: OverlayHandle, position: Point): void;
  setOverlayPath(overlay: OverlayHandle, path: Point[]): void;
  setOverlayOptions(overlay: OverlayHandle, options: unknown): void;
  /** Overlay 基类 show() — 显示覆盖物 */
  showOverlay(overlay: OverlayHandle): void;
  /** Overlay 基类 hide() — 隐藏覆盖物 */
  hideOverlay(overlay: OverlayHandle): void;
  /** Marker.openPlaceDetail — 打开地点详情窗口（仅 v4+） */
  openPlaceDetail(marker: OverlayHandle, placeDetail: ServiceHandle): void;
  /** Marker.closePlaceDetail — 关闭地点详情窗口（仅 v4+） */
  closePlaceDetail(marker: OverlayHandle): void;

  // ─────────────── 28. Control 工厂 ───────────────
  createNavigationControl(options?: unknown): ControlHandle | null;
  createNavigationControl3D(options?: unknown): ControlHandle | null;
  createScaleControl(options?: unknown): ControlHandle | null;
  createOverviewMapControl(options?: unknown): ControlHandle | null;
  createMapTypeControl(options?: unknown): ControlHandle | null;
  createCopyrightControl(options?: unknown): ControlHandle | null;
  createGeolocationControl(options?: unknown): ControlHandle | null;
  createPanoramaControl(options?: unknown): ControlHandle | null;
  createZoomControl(options?: unknown): ControlHandle | null;
  createCityListControl(options?: unknown): ControlHandle | null;
  createLocationControl(options?: unknown): ControlHandle | null;
  createLogoControl(options?: unknown): ControlHandle | null;
  createControl(options?: unknown): ControlHandle | null;

  // ─────────────── 29. Layer 工厂 ───────────────
  createTileLayer(options?: unknown): LayerHandle | null;
  createNormalLayer(options?: unknown): LayerHandle | null;
  createGeoJSONLayer(options?: unknown): LayerHandle | null;
  createDistrictLayer(options?: unknown): LayerHandle | null;
  createTrafficLayer(options?: unknown): LayerHandle | null;
  createCustomLayer(options?: unknown): LayerHandle | null;
  createCanvasLayer(options?: unknown): LayerHandle | null;
  // 高级图层（4.0+）
  createRasterTileLayer(options?: unknown): LayerHandle | null;
  createWMSLayer(options?: unknown): LayerHandle | null;
  createWMTSLayer(options?: unknown): LayerHandle | null;
  createXYZLayer(options?: unknown): LayerHandle | null;
  createMVTLayer(options?: unknown): LayerHandle | null;
  createFeatureLayer(options?: unknown): LayerHandle | null;
  createFillLayer(options?: unknown): LayerHandle | null;
  createDOMLayer(options?: unknown): LayerHandle | null;
  createPointIconLayer(options?: unknown): LayerHandle | null;
  createPointShapeLayer(options?: unknown): LayerHandle | null;
  createPanoramaCoverageLayer(options?: unknown): LayerHandle | null;

  // ─────────────── 30. ContextMenu 工厂 ───────────────
  createContextMenu(options?: unknown): OverlayHandle | null;
  createMenuItem(text: string, callback: () => void, options?: unknown): OverlayHandle | null;
  addMenuItem(menu: OverlayHandle, item: OverlayHandle, insertIndex?: number): void;
  removeMenuItem(menu: OverlayHandle, item: OverlayHandle): void;

  // ─────────────── 31. Panorama ───────────────
  createPanorama(container: HTMLElement, options?: unknown): MapHandle | null;
  createPanoramaLabel(options?: unknown): OverlayHandle | null;
  destroyPanorama(handle: MapHandle): void;

  // ─────────────── 32. 服务工厂 ───────────────
  createLocalSearch(location: unknown, options?: unknown): ServiceHandle;
  createGeocoder(): ServiceHandle;
  createDrivingRoute(options?: unknown): ServiceHandle;
  createWalkingRoute(options?: unknown): ServiceHandle;
  createRidingRoute(options?: unknown): ServiceHandle;
  createTransitRoute(options?: unknown): ServiceHandle;
  createBusLineSearch(options?: unknown): ServiceHandle;
  createAutocomplete(options?: unknown): ServiceHandle;
  createBoundary(): ServiceHandle;
  createGeolocation(options?: unknown): ServiceHandle;
  createLocalCity(options?: unknown): ServiceHandle;
  createPlaceDetail(options?: unknown): ServiceHandle;
  createConvertor(): ServiceHandle;
  createPanoramaService(): ServiceHandle;

  searchService(
    service: ServiceHandle,
    query: unknown,
    callbacks: { onSuccess?: (data: unknown) => void; onError?: (err: Error) => void },
  ): () => void;
  getServiceResults(service: ServiceHandle): unknown;

  // ─────────────── 33. 事件 ───────────────
  addEventListener(target: MapHandle | OverlayHandle, type: string, handler: (raw: unknown) => void): () => void;
  removeEventListener(target: MapHandle | OverlayHandle, type: string, handler: (raw: unknown) => void): void;
}

export type { LoadKeyComponents, LayerKind };
