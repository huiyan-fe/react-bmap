/**
 * 全部 Control 组件 — 使用 createControlComponent 工厂批量生成。
 */
import { createControlComponent } from '../../utils/createComponent';
import type { Bounds, Size } from '../../types';
import type {
  ControlAnchor,
  LengthUnit,
  MapTypeControlType,
  NavigationControlType,
} from '../../constants';
import type { PlainIcon } from '../Overlay/types';

interface ControlReactProps {
  /** 控制控件显示/隐藏。undefined 或 true = 显示，false = 隐藏 */
  visible?: boolean;
}

export interface NavigationControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  type?: NavigationControlType;
  showZoomInfo?: boolean;
  enableGeolocation?: boolean;
}

export interface NavigationControl3DOptions {
  anchor?: ControlAnchor;
  offset?: Size;
}

export interface ScaleControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  /** 比例尺单位制，走 setUnit() */
  unit?: LengthUnit;
}

export interface OverviewMapControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  size?: Size;
  isOpen?: boolean;
  zoomInterval?: number;
  padding?: number;
}

export interface MapTypeControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  type?: MapTypeControlType;
  mapTypes?: unknown[];
  enableSwitch?: boolean;
  /** 是否显示路网层，走 showStreetLayer() */
  showStreetLayer?: boolean;
}

export interface CopyrightItem {
  id: number;
  content?: string;
  bounds?: Bounds;
}

export interface CopyrightControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  /** 自定义版权信息，创建和更新时调用 addCopyright() */
  copyrights?: CopyrightItem[];
}

export interface GeolocationControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  showAddressBar?: boolean;
  enableAutoLocation?: boolean;
  locationIcon?: PlainIcon | unknown;
  watchPosition?: boolean;
  useCompass?: boolean;
  autoZoom?: boolean;
  autoViewport?: boolean;
  /** @since 4.0 定位前回调；返回 false 可阻止默认定位 */
  onLocationStart?: (onSuccess: Function, onFail: Function) => boolean | void;
}

export interface PanoramaControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
}

export interface ZoomControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
}

export interface CityListControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  expand?: boolean;
  /** @since 4.0 自定义触发元素 */
  trigger?: HTMLElement;
  onChangeBefore?: () => void;
  onChangeAfter?: () => void;
  onChangeSuccess?: (poi: { city: string; code: string | number }) => void;
  /** @since 4.0 */
  onOpen?: () => void;
  /** @since 4.0 */
  onClose?: () => void;
  canCheckSize?: boolean;
}

export type LocationControlOptions = GeolocationControlOptions;

export interface LogoControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
}

export interface NavigationControlProps extends NavigationControlOptions, ControlReactProps {}
export interface NavigationControl3DProps extends NavigationControl3DOptions, ControlReactProps {}
export interface ScaleControlProps extends ScaleControlOptions, ControlReactProps {}
export interface OverviewMapControlProps extends OverviewMapControlOptions, ControlReactProps {
  onViewChanged?: (raw: unknown) => void;
  onViewChanging?: (raw: unknown) => void;
  onResize?: (raw: unknown) => void;
}
export interface MapTypeControlProps extends MapTypeControlOptions, ControlReactProps {}
export interface CopyrightControlProps extends CopyrightControlOptions, ControlReactProps {}
export interface GeolocationControlProps extends GeolocationControlOptions, ControlReactProps {
  onLocationSuccess?: (raw: unknown) => void;
  onLocationError?: (raw: unknown) => void;
}
export interface PanoramaControlProps extends PanoramaControlOptions, ControlReactProps {}
export interface ZoomControlProps extends ZoomControlOptions, ControlReactProps {}
export interface CityListControlProps extends CityListControlOptions, ControlReactProps {}
export type LocationControlProps = GeolocationControlProps;
export interface LogoControlProps extends LogoControlOptions, ControlReactProps {}

export const NavigationControl = createControlComponent<NavigationControlProps>({
  displayName: 'NavigationControl',
  factory: (d, p) => d.createNavigationControl(p),
  optionProps: ['anchor', 'offset', 'type'],
  ctorOnlyProps: ['showZoomInfo', 'enableGeolocation'],
});

export const NavigationControl3D = createControlComponent<NavigationControl3DProps>({
  displayName: 'NavigationControl3D',
  factory: (d, p) => d.createNavigationControl3D(p),
  optionProps: ['anchor', 'offset'],
});

export const ScaleControl = createControlComponent<ScaleControlProps>({
  displayName: 'ScaleControl',
  factory: (d, p) => d.createScaleControl(p),
  optionProps: ['anchor', 'offset', 'unit'],
});

export const OverviewMapControl = createControlComponent<OverviewMapControlProps>({
  displayName: 'OverviewMapControl',
  factory: (d, p) => d.createOverviewMapControl(p),
  optionProps: ['anchor', 'offset', 'size', 'isOpen'],
  ctorOnlyProps: ['zoomInterval', 'padding'],
  events: [
    { sdk: 'viewchanged', prop: 'onViewChanged' },
    { sdk: 'viewchanging', prop: 'onViewChanging' },
    { sdk: 'resize', prop: 'onResize' },
  ],
});

export const MapTypeControl = createControlComponent<MapTypeControlProps>({
  displayName: 'MapTypeControl',
  factory: (d, p) => d.createMapTypeControl(p),
  optionProps: ['anchor', 'offset', 'showStreetLayer'],
  ctorOnlyProps: ['type', 'mapTypes', 'enableSwitch'],
});

export const CopyrightControl = createControlComponent<CopyrightControlProps>({
  displayName: 'CopyrightControl',
  factory: (d, p) => d.createCopyrightControl(p),
  optionProps: ['anchor', 'offset', 'copyrights'],
});

export const GeolocationControl = createControlComponent<GeolocationControlProps>({
  displayName: 'GeolocationControl',
  factory: (d, p) => d.createGeolocationControl(p),
  optionProps: [
    'anchor', 'offset', 'enableAutoLocation', 'locationIcon',
    'watchPosition', 'useCompass', 'autoZoom', 'autoViewport', 'onLocationStart',
  ],
  ctorOnlyProps: ['showAddressBar'],
  events: [
    { sdk: 'locationSuccess', prop: 'onLocationSuccess' },
    { sdk: 'locationError', prop: 'onLocationError' },
  ],
});

export const PanoramaControl = createControlComponent<PanoramaControlProps>({
  displayName: 'PanoramaControl',
  factory: (d, p) => d.createPanoramaControl(p),
  optionProps: ['anchor', 'offset'],
});

export const ZoomControl = createControlComponent<ZoomControlProps>({
  displayName: 'ZoomControl',
  factory: (d, p) => d.createZoomControl(p),
  optionProps: ['anchor', 'offset'],
});

export const CityListControl = createControlComponent<CityListControlProps>({
  displayName: 'CityListControl',
  factory: (d, p) => d.createCityListControl(p),
  optionProps: ['anchor', 'offset'],
  ctorOnlyProps: ['expand', 'trigger', 'onChangeBefore', 'onChangeAfter', 'onChangeSuccess', 'canCheckSize'],
  events: [
    { sdk: 'onopen', prop: 'onOpen' },
    { sdk: 'onclose', prop: 'onClose' },
  ],
});

export const LocationControl = GeolocationControl;

export const LogoControl = createControlComponent<LogoControlProps>({
  displayName: 'LogoControl',
  factory: (d, p) => d.createLogoControl(p),
  optionProps: ['anchor', 'offset'],
});
