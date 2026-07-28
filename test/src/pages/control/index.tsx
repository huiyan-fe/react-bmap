/**
 * 控件独立测试页（12 个）— 使用 makeControlTestPage 模板生成。
 */
import { makeControlTestPage } from '../templates';
import {
  NavigationControl, NavigationControl3D, ScaleControl, OverviewMapControl,
  MapTypeControl, CopyrightControl, GeolocationControl, PanoramaControl,
  ZoomControl, CityListControl, LocationControl, LogoControl,
} from 'react-bmap';

export const NavigationControlPage = makeControlTestPage('NavigationControl', NavigationControl, { anchor: 0 });
export const NavigationControl3DPage = makeControlTestPage('NavigationControl3D', NavigationControl3D, {});
export const ScaleControlPage = makeControlTestPage('ScaleControl', ScaleControl, { anchor: 2 });
export const OverviewMapControlPage = makeControlTestPage('OverviewMapControl', OverviewMapControl, { anchor: 3, isOpen: true });
export const MapTypeControlPage = makeControlTestPage('MapTypeControl', MapTypeControl, { anchor: 1 });
export const CopyrightControlPage = makeControlTestPage('CopyrightControl', CopyrightControl, { anchor: 2 });
export const GeolocationControlPage = makeControlTestPage('GeolocationControl', GeolocationControl, { anchor: 0 });
export const PanoramaControlPage = makeControlTestPage('PanoramaControl', PanoramaControl, { anchor: 1 });
export const ZoomControlPage = makeControlTestPage('ZoomControl', ZoomControl, {});
export const CityListControlPage = makeControlTestPage('CityListControl', CityListControl, {});
export const LocationControlPage = makeControlTestPage('LocationControl', LocationControl, {});
export const LogoControlPage = makeControlTestPage('LogoControl', LogoControl, {});
