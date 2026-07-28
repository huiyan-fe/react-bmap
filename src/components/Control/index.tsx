/**
 * 全部 Control 组件 — 使用 createControlComponent 工厂批量生成。
 */
import { createControlComponent } from '../../utils/createComponent';
import type { Size } from '../../types';
import type { ControlAnchor } from '../../constants';

// Options 接口（字段对照 dts src/control/*Options.d.ts）
export interface NavigationControlOptions { anchor?: ControlAnchor; offset?: Size; type?: number; showZoomInfo?: boolean; enableGeolocation?: boolean; }
export type NavigationControl3DOptions = Pick<NavigationControlOptions, 'anchor' | 'offset'>;
export type ScaleControlOptions = Pick<NavigationControlOptions, 'anchor' | 'offset'>;
export interface OverviewMapControlOptions extends Pick<NavigationControlOptions, 'anchor' | 'offset'> { size?: Size; isOpen?: boolean; zoomInterval?: number; padding?: number; }
export interface MapTypeControlOptions extends Pick<NavigationControlOptions, 'anchor' | 'offset'> { type?: number; mapTypes?: unknown[]; enableSwitch?: boolean; }
export type CopyrightControlOptions = Pick<NavigationControlOptions, 'anchor' | 'offset'>;
export interface GeolocationControlOptions extends Pick<NavigationControlOptions, 'anchor' | 'offset'> { showAddressBar?: boolean; enableAutoLocation?: boolean; locationIcon?: unknown; watchPosition?: boolean; useCompass?: boolean; autoZoom?: boolean; autoViewport?: boolean; onLocationStart?: (onSuccess: Function, onFail: Function) => boolean | void; }
export interface PanoramaControlOptions { anchor?: ControlAnchor; offset?: Size; }
export type ZoomControlOptions = Pick<NavigationControlOptions, 'anchor' | 'offset'>;
export interface CityListControlOptions extends Pick<NavigationControlOptions, 'anchor' | 'offset'> { expand?: boolean; trigger?: HTMLElement; onChangeBefore?: () => void; onChangeAfter?: () => void; onChangeSuccess?: (poi: { city: string; code: string | number }) => void; onOpen?: () => void; onClose?: () => void; canCheckSize?: boolean; }
export interface LocationControlOptions extends Pick<NavigationControlOptions, 'anchor' | 'offset'> { watchPosition?: boolean; useCompass?: boolean; autoZoom?: boolean; autoViewport?: boolean; onLocationStart?: (onSuccess: Function, onFail: Function) => boolean | void; }
export type LogoControlOptions = Pick<NavigationControlOptions, 'anchor' | 'offset'>;

// Props = Options
export type NavigationControlProps = NavigationControlOptions;
export type NavigationControl3DProps = NavigationControl3DOptions;
export type ScaleControlProps = ScaleControlOptions;
export type OverviewMapControlProps = OverviewMapControlOptions;
export type MapTypeControlProps = MapTypeControlOptions;
export type CopyrightControlProps = CopyrightControlOptions;
export type GeolocationControlProps = GeolocationControlOptions;
export type PanoramaControlProps = PanoramaControlOptions;
export type ZoomControlProps = ZoomControlOptions;
export type CityListControlProps = CityListControlOptions;
export type LocationControlProps = LocationControlOptions;
export type LogoControlProps = LogoControlOptions;

// 组件
export const NavigationControl = createControlComponent<NavigationControlProps>({ displayName: 'NavigationControl', factory: (d, p) => d.createNavigationControl(p) });
export const NavigationControl3D = createControlComponent<NavigationControl3DProps>({ displayName: 'NavigationControl3D', factory: (d, p) => d.createNavigationControl3D(p) });
export const ScaleControl = createControlComponent<ScaleControlProps>({ displayName: 'ScaleControl', factory: (d, p) => d.createScaleControl(p) });
export const OverviewMapControl = createControlComponent<OverviewMapControlProps>({ displayName: 'OverviewMapControl', factory: (d, p) => d.createOverviewMapControl(p) });
export const MapTypeControl = createControlComponent<MapTypeControlProps>({ displayName: 'MapTypeControl', factory: (d, p) => d.createMapTypeControl(p) });
export const CopyrightControl = createControlComponent<CopyrightControlProps>({ displayName: 'CopyrightControl', factory: (d, p) => d.createCopyrightControl(p) });
export const GeolocationControl = createControlComponent<GeolocationControlProps>({ displayName: 'GeolocationControl', factory: (d, p) => d.createGeolocationControl(p) });
export const PanoramaControl = createControlComponent<PanoramaControlProps>({ displayName: 'PanoramaControl', factory: (d) => d.createPanoramaControl({}) });
export const ZoomControl = createControlComponent<ZoomControlProps>({ displayName: 'ZoomControl', factory: (d, p) => d.createZoomControl(p) });
export const CityListControl = createControlComponent<CityListControlProps>({ displayName: 'CityListControl', factory: (d, p) => d.createCityListControl(p) });
export const LocationControl = createControlComponent<LocationControlProps>({ displayName: 'LocationControl', factory: (d, p) => d.createLocationControl(p) });
export const LogoControl = createControlComponent<LogoControlProps>({ displayName: 'LogoControl', factory: (d, p) => d.createLogoControl(p) });
