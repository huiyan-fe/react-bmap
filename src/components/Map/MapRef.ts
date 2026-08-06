import type { BMapDriver } from '../../drivers/types';
import type {
  Bounds, ControlHandle, LayerHandle, MapHandle, OverlayHandle,
  Pixel, Point, Size,
} from '../../types';

/**
 * MapRef — 命令式句柄，全量透传 driver 方法。
 *
 * 签名与 bmap-jsapi-dts 的 Map 类一致。
 * 不支持时由 driver 内部按 unsupportedBehavior 处理。
 */
export class MapRefImpl {
  constructor(private map: MapHandle, private driver: BMapDriver) {}

  // ─── 交互开关 ───
  enableDragging(): void { this.driver.enableDragging(this.map); }
  disableDragging(): void { this.driver.disableDragging(this.map); }
  enableInertialDragging(): void { this.driver.enableInertialDragging(this.map); }
  disableInertialDragging(): void { this.driver.disableInertialDragging(this.map); }
  enableScrollWheelZoom(): void { this.driver.enableScrollWheelZoom(this.map); }
  disableScrollWheelZoom(): void { this.driver.disableScrollWheelZoom(this.map); }
  enableContinuousZoom(): void { this.driver.enableContinuousZoom(this.map); }
  disableContinuousZoom(): void { this.driver.disableContinuousZoom(this.map); }
  enableResizeOnCenter(): void { this.driver.enableResizeOnCenter(this.map); }
  disableResizeOnCenter(): void { this.driver.disableResizeOnCenter(this.map); }
  enableDoubleClickZoom(): void { this.driver.enableDoubleClickZoom(this.map); }
  disableDoubleClickZoom(): void { this.driver.disableDoubleClickZoom(this.map); }
  enableKeyboard(): void { this.driver.enableKeyboard(this.map); }
  disableKeyboard(): void { this.driver.disableKeyboard(this.map); }
  enablePinchToZoom(): void { this.driver.enablePinchToZoom(this.map); }
  disablePinchToZoom(): void { this.driver.disablePinchToZoom(this.map); }
  enableRotate(): void { this.driver.enableRotate(this.map); }
  disableRotate(): void { this.driver.disableRotate(this.map); }
  enableRotateGestures(): void { this.driver.enableRotateGestures(this.map); }
  disableRotateGestures(): void { this.driver.disableRotateGestures(this.map); }
  enableTilt(): void { this.driver.enableTilt(this.map); }
  disableTilt(): void { this.driver.disableTilt(this.map); }
  enableTiltGestures(): void { this.driver.enableTiltGestures(this.map); }
  disableTiltGestures(): void { this.driver.disableTiltGestures(this.map); }
  enableAutoResize(): void { this.driver.enableAutoResize(this.map); }
  disableAutoResize(): void { this.driver.disableAutoResize(this.map); }

  // ─── 视角 ───
  setHeading(heading: number, options?: unknown): void { this.driver.setHeading(this.map, heading, options); }
  getHeading(): number { return this.driver.getHeading(this.map); }
  setTilt(tilt: number, options?: unknown): void { this.driver.setTilt(this.map, tilt, options); }
  getTilt(): number { return this.driver.getTilt(this.map); }
  getCurrentMaxTilt(): number { return this.driver.getCurrentMaxTilt(this.map); }

  // ─── 缩放级别 ───
  setMinZoom(zoom: number): void { this.driver.setMinZoom(this.map, zoom); }
  setMaxZoom(zoom: number): void { this.driver.setMaxZoom(this.map, zoom); }
  getMinZoom(): number { return this.driver.getMinZoom(this.map); }
  getMaxZoom(): number { return this.driver.getMaxZoom(this.map); }

  // ─── resize ───
  checkResize(): void { this.driver.checkResize(this.map); }
  resize(): void { this.driver.resize(this.map); }
  setSize(size: { width: number; height: number }): void { this.driver.setSize(this.map, size); }
  zoomTo(level: number, point?: unknown): void { this.driver.zoomTo(this.map, level, point); }

  // ─── 显示配置 ───
  setDisplayOptions(options: unknown): void { this.driver.setDisplayOptions(this.map, options); }
  setOptions(options: unknown): void { this.driver.setOptions(this.map, options); }

  // ─── 容器信息 ───
  getSize(): Size { return this.driver.getSize(this.map); }
  getContainerSize(): Size { return this.driver.getContainerSize(this.map); }
  getZoomUnits(): number { return this.driver.getZoomUnits(this.map); }
  getContainer(): HTMLElement { return this.driver.getContainer(this.map); }

  // ─── 坐标转换 ───
  pixelToPoint(pixel: Pixel, options?: unknown): Point { return this.driver.pixelToPoint(this.map, pixel, options); }
  pointToPixel(point: Point, options?: unknown): Pixel { return this.driver.pointToPixel(this.map, point, options); }
  lnglatToMercator(lng: number, lat: number): [number, number] { return this.driver.lnglatToMercator(this.map, lng, lat); }
  mercatorToLnglat(mcLng: number, mcLat: number): [number, number] { return this.driver.mercatorToLnglat(this.map, mcLng, mcLat); }
  pointToOverlayPixel(point: Point, options?: unknown): Pixel { return this.driver.pointToOverlayPixel(this.map, point, options); }
  overlayPixelToPoint(pixel: Pixel, options?: unknown): Point { return this.driver.overlayPixelToPoint(this.map, pixel, options); }
  getDistance(start: Point, end: Point): number { return this.driver.getDistance(this.map, start, end); }

  // ─── 地图状态 ───
  isLoaded(): boolean { return this.driver.isLoaded(this.map); }
  getCoordType(): string { return this.driver.getCoordType(this.map); }
  getMapTypeId(): string { return this.driver.getMapTypeId(this.map); }
  getMapCoordType(): string { return this.driver.getMapCoordType(this.map); }
  getMapStyleId(): string { return this.driver.getMapStyleId(this.map); }
  getAreaStyleId(): string { return this.driver.getAreaStyleId(this.map); }
  getRenderType(): string { return this.driver.getRenderType(this.map); }
  isCanvasMap(): boolean { return this.driver.isCanvasMap(this.map); }
  getProjection(): unknown { return this.driver.getProjection(this.map); }

  getSolarInfo(date: Date): unknown { return this.driver.getSolarInfo(this.map, date); }
  getTileId(point: Point, level: number): string { return this.driver.getTileId(this.map, point, level); }
  getPoiByUid(uid: string, callback: (poi: unknown) => void): void { this.driver.getPoiByUid(this.map, uid, callback); }
  getPanes(): unknown { return this.driver.getPanes(this.map); }
  getInfoWindow(): OverlayHandle | null { return this.driver.getInfoWindow(this.map); }

  // ─── Spots / 标注 ───
  addSpots(spots: unknown[], options?: unknown): string { return this.driver.addSpots(this.map, spots, options); }
  getSpots(id: string): unknown[] { return this.driver.getSpots(this.map, id); }
  removeSpots(id: string): void { this.driver.removeSpots(this.map, id); }
  clearSpots(): void { this.driver.clearSpots(this.map); }
  resetSpotStatus(): void { this.driver.resetSpotStatus(this.map); }
  hightlightSpotByUid(uid: string, tilePosStr: string): void { this.driver.hightlightSpotByUid(this.map, uid, tilePosStr); }
  addAreaSpot(areaSpot: number[], options?: unknown): string { return this.driver.addAreaSpot(this.map, areaSpot, options); }
  getAreaSpot(id: string): number[] { return this.driver.getAreaSpot(this.map, id); }
  removeAreaSpot(id: string): void { this.driver.removeAreaSpot(this.map, id); }
  clearAreaSpots(): void { this.driver.clearAreaSpots(this.map); }
  clearLabels(): void { this.driver.clearLabels(this.map); }
  addMapLabels(labels: unknown[]): string[] { return this.driver.addMapLabels(this.map, labels); }
  removeMapLabels(labelUids: string[]): void { this.driver.removeMapLabels(this.map, labelUids); }
  getIconByClickPosition(clickPosition: Pixel): unknown | null { return this.driver.getIconByClickPosition(this.map, clickPosition); }
  setBounds(bounds: Bounds): void { this.driver.setBounds(this.map, bounds); }

  // ─── 视野控制 ───
  centerAndZoom(center: Point | string, zoom?: number, options?: unknown): void { this.driver.centerAndZoom(this.map, center, zoom, options); }
  panTo(center: Point, options?: unknown): void { this.driver.panTo(this.map, center, options); }
  panBy(x: number, y: number, options?: unknown): void { this.driver.panBy(this.map, x, y, options); }
  flyTo(center: Point, zoom: number, options?: unknown): void { this.driver.flyTo(this.map, center, zoom, options); }
  reset(): void { this.driver.reset(this.map); }
  setCenter(center: Point | string, options?: unknown): void { this.driver.setCenter(this.map, center, options); }
  getCenter(): Point { return this.driver.getCenter(this.map); }
  setViewport(view: Point[] | unknown, viewportOptions?: unknown): void { this.driver.setViewport(this.map, view, viewportOptions); }
  getViewport(view: Point[] | Bounds, viewportOptions?: unknown): unknown { return this.driver.getViewport(this.map, view, viewportOptions); }
  setZoom(zoom: number, options?: unknown): void { this.driver.setZoom(this.map, zoom, options); }
  getZoom(): number { return this.driver.getZoom(this.map); }
  zoomIn(zoomCenter?: Point): void { this.driver.zoomIn(this.map, zoomCenter); }
  zoomOut(zoomCenter?: Point): void { this.driver.zoomOut(this.map, zoomCenter); }
  getBounds(): Bounds { return this.driver.getBounds(this.map); }
  restrictBounds(bounds: Bounds | null): void { this.driver.restrictBounds(this.map, bounds); }

  // ─── 地图类型 ───
  setMapType(mapTypeId: string | number): void { this.driver.setMapType(this.map, mapTypeId); }
  getMapType(): string { return this.driver.getMapType(this.map); }

  // ─── 控件 / 右键菜单 ───
  addControl(control: ControlHandle): void { this.driver.addControl(this.map, control); }
  removeControl(control: ControlHandle): void { this.driver.removeControl(this.map, control); }
  addContextMenu(menu: OverlayHandle): void { this.driver.addContextMenu(this.map, menu); }
  removeContextMenu(menu: OverlayHandle): void { this.driver.removeContextMenu(this.map, menu); }

  // ─── 覆盖物 ───
  addOverlay(overlay: OverlayHandle): void { this.driver.addOverlay(this.map, overlay); }
  removeOverlay(overlay: OverlayHandle): void { this.driver.removeOverlay(this.map, overlay); }
  clearOverlays(): void { this.driver.clearOverlays(this.map); }
  getOverlays(): OverlayHandle[] { return this.driver.getOverlays(this.map); }

  // ─── 图层 ───
  addLayer(layer: LayerHandle): void { this.driver.addLayer(this.map, layer); }
  removeLayer(layer: LayerHandle): void { this.driver.removeLayer(this.map, layer); }
  addTileLayer(layer: LayerHandle): void { this.driver.addTileLayer(this.map, layer); }
  removeTileLayer(layer: LayerHandle): void { this.driver.removeTileLayer(this.map, layer); }
  getTileLayer(mapType: string): LayerHandle | null { return this.driver.getTileLayer(this.map, mapType); }
  addGeoJSONLayer(layer: LayerHandle): void { this.driver.addGeoJSONLayer(this.map, layer); }
  removeGeoJSONLayer(layer: LayerHandle): void { this.driver.removeGeoJSONLayer(this.map, layer); }
  addDistrictLayer(layer: LayerHandle): void { this.driver.addDistrictLayer(this.map, layer); }
  removeDistrictLayer(layer: LayerHandle): void { this.driver.removeDistrictLayer(this.map, layer); }
  addNormalLayer(layer: LayerHandle): void { this.driver.addNormalLayer(this.map, layer); }
  removeNormalLayer(layer: LayerHandle): void { this.driver.removeNormalLayer(this.map, layer); }
  setTrafficOn(): void { this.driver.setTrafficOn(this.map); }
  setTrafficOff(): void { this.driver.setTrafficOff(this.map); }
  showOverlayContainer(): void { this.driver.showOverlayContainer(this.map); }
  hideOverlayContainer(): void { this.driver.hideOverlayContainer(this.map); }

  // ─── 信息窗口 ───
  openInfoWindow(iw: OverlayHandle, point?: Point): void { this.driver.openInfoWindow(this.map, iw, point); }
  closeInfoWindow(): void { this.driver.closeInfoWindow(this.map); }

  // ─── 样式 / 主题 ───
  setMapStyle(config: unknown): void { this.driver.setMapStyle(this.map, config); }
  setMapStyleV2(options: unknown): void { this.driver.setMapStyleV2(this.map, options); }
  setTheme(theme: string, customVars?: Record<string, string>): void { this.driver.setTheme(this.map, theme, customVars); }
  setCopyrightOffset(logo: unknown, cpy: unknown): void { this.driver.setCopyrightOffset(this.map, logo, cpy); }
  setDefaultCursor(cursor: string): void { this.driver.setDefaultCursor(this.map, cursor); }
  getDefaultCursor(): string { return this.driver.getDefaultCursor(this.map); }
  setDraggingCursor(cursor: string): void { this.driver.setDraggingCursor(this.map, cursor); }
  getDraggingCursor(): string { return this.driver.getDraggingCursor(this.map); }
  setOverlayMoveCursor(cursor: string): void { this.driver.setOverlayMoveCursor(this.map, cursor); }

  // ─── 视角动画 ───
  startViewAnimation(viewAnimation: unknown): number { return this.driver.startViewAnimation(this.map, viewAnimation); }
  pauseViewAnimation(viewAnimation?: unknown): void { this.driver.pauseViewAnimation(this.map, viewAnimation); }
  continueViewAnimation(viewAnimation?: unknown): void { this.driver.continueViewAnimation(this.map, viewAnimation); }
  cancelViewAnimation(viewAnimation?: unknown): void { this.driver.cancelViewAnimation(this.map, viewAnimation); }

  // ─── 截图 ───
  getScreenshot(): string { return this.driver.getScreenshot(this.map); }

  // ─── 地球模式 ───
  isSupportEarth(): boolean { return this.driver.isSupportEarth(this.map); }
  getEarth(): unknown { return this.driver.getEarth(this.map); }
  showEarthBoundary(): void { this.driver.showEarthBoundary(this.map); }
  hideEarthBoundary(): void { this.driver.hideEarthBoundary(this.map); }
  setEarthMaxZoom(zoom: number): void { this.driver.setEarthMaxZoom(this.map, zoom); }
  setEarthMinZoom(zoom: number): void { this.driver.setEarthMinZoom(this.map, zoom); }

  // ─── 室内 ───
  showIndoor(uid: string, floor: number): void { this.driver.showIndoor(this.map, uid, floor); }
  setIndoor(uid: string, floor: number): void { this.driver.setIndoor(this.map, uid, floor); }
  getIndoorInfo(): unknown | null { return this.driver.getIndoorInfo(this.map); }
  initIndoorLayer(opts?: unknown): unknown { return this.driver.initIndoorLayer(this.map, opts); }
  setNormalMapDisplay(display: boolean): void { this.driver.setNormalMapDisplay(this.map, display); }
  getVectorContainer(): unknown { return this.driver.getVectorContainer(this.map); }

  // ─── 街景图层 ───
  showStreetLayer(show: boolean): void { this.driver.showStreetLayer(this.map, show); }
  hideStreetLayer(): void { this.driver.hideStreetLayer(this.map); }
  isStreetLayerShow(): boolean { return this.driver.isStreetLayerShow(this.map); }
  showVectorStreetLayer(): void { this.driver.showVectorStreetLayer(this.map); }
  hideVectorStreetLayer(): void { this.driver.hideVectorStreetLayer(this.map); }

  // ─── 语言 ───
  getLanguage(): string { return this.driver.getLanguage(this.map); }
  changeLanguage(language: string): void { this.driver.changeLanguage(this.map, language); }
  enablePreferredLanguage(language: string): void { this.driver.enablePreferredLanguage(this.map, language); }
  disablePreferredLanguage(): void { this.driver.disablePreferredLanguage(this.map); }

  // ─── 私有 / 焦点遮罩 / 自定义 HTML 图层 ───
  setLock(lock: boolean): void { this.driver.setLock(this.map, lock); }
  setPrivateRegions(regions: unknown[]): void { this.driver.setPrivateRegions(this.map, regions); }
  getPrivateRegions(): unknown[] { return this.driver.getPrivateRegions(this.map); }
  setPrivateStatus(isOn: boolean): void { this.driver.setPrivateStatus(this.map, isOn); }
  getPrivateStatus(): boolean { return this.driver.getPrivateStatus(this.map); }
  setCustomArea(config: unknown): void { this.driver.setCustomArea(this.map, config); }
  addFocusMask(mask: unknown): void { this.driver.addFocusMask(this.map, mask); }
  removeFocusMask(mask: unknown): void { this.driver.removeFocusMask(this.map, mask); }
  clearFocusMasks(): void { this.driver.clearFocusMasks(this.map); }
  addCustomHtmlLayer(layer: unknown): void { this.driver.addCustomHtmlLayer(this.map, layer); }
  removeCustomHtmlLayer(layer: unknown): void { this.driver.removeCustomHtmlLayer(this.map, layer); }
  addParkingSpot(layer: unknown): void { this.driver.addParkingSpot(this.map, layer); }
  removeParkingSpot(parking: unknown): void { this.driver.removeParkingSpot(this.map, parking); }

  // ─── 3.0-only ───
  enableMapClick(): void { this.driver.enableMapClick(this.map); }
  disableMapClick(): void { this.driver.disableMapClick(this.map); }
  enable3DBuilding(): void { this.driver.enable3DBuilding(this.map); }
  disable3DBuilding(): void { this.driver.disable3DBuilding(this.map); }
  setPanorama(pano: unknown): void { this.driver.setPanorama(this.map, pano); }
  getPanorama(): unknown { return this.driver.getPanorama(this.map); }
  setCurrentCity(city: string): void { this.driver.setCurrentCity(this.map, city); }
  highResolutionEnabled(): boolean { return this.driver.highResolutionEnabled(this.map); }
  addHotspot(hotspot: OverlayHandle): void { this.driver.addHotspot(this.map, hotspot); }
  removeHotspot(hotspot: OverlayHandle): void { this.driver.removeHotspot(this.map, hotspot); }
  clearHotspots(): void { this.driver.clearHotspots(this.map); }

  // ─── 事件 ───
  addEventListener(type: string, handler: (raw: unknown) => void): () => void {
    return this.driver.addEventListener(this.map, type, handler);
  }
  removeEventListener(type: string, handler: (raw: unknown) => void): void {
    this.driver.removeEventListener(this.map, type, handler);
  }

  // ─── Map 维护 ───
  destroy(): void { this.driver.destroyMap(this.map); }
}

export type MapRef = MapRefImpl;
