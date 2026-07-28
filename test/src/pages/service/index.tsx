/**
 * 服务独立测试页（14 个）— 使用 makeServiceTestPage 模板生成。
 */
import { makeServiceTestPage } from '../templates';
import {
  useLocalSearch, useGeocoder, useDrivingRoute, useWalkingRoute,
  useRidingRoute, useTransitRoute, useBusLineSearch, useAutocomplete,
  useBoundary, useGeolocation, useLocalCity, usePlaceDetail, useConvertor,
  usePanoramaService,
} from 'react-bmap';

export const LocalSearchPage = makeServiceTestPage({ name: 'useLocalSearch', hook: () => useLocalSearch('北京'), defaultQuery: '餐厅' });
export const GeocoderPage = makeServiceTestPage({ name: 'useGeocoder', hook: () => useGeocoder(), defaultQuery: '北京市天安门' });
export const DrivingRoutePage = makeServiceTestPage({ name: 'useDrivingRoute', hook: () => useDrivingRoute({ location: '北京' }), defaultQuery: '天安门到西单' });
export const WalkingRoutePage = makeServiceTestPage({ name: 'useWalkingRoute', hook: () => useWalkingRoute({ location: '北京' }), defaultQuery: '天安门到王府井' });
export const RidingRoutePage = makeServiceTestPage({ name: 'useRidingRoute', hook: () => useRidingRoute({ location: '北京' }), defaultQuery: '天安门到鸟巢' });
export const TransitRoutePage = makeServiceTestPage({ name: 'useTransitRoute', hook: () => useTransitRoute({ location: '北京' }), defaultQuery: '天安门到中关村' });
export const BusLineSearchPage = makeServiceTestPage({ name: 'useBusLineSearch', hook: () => useBusLineSearch({}), defaultQuery: '1路' });
export const AutocompletePage = makeServiceTestPage({ name: 'useAutocomplete', hook: () => useAutocomplete({ location: '北京' }), defaultQuery: '餐厅' });
export const BoundaryPage = makeServiceTestPage({ name: 'useBoundary', hook: () => useBoundary(), defaultQuery: '北京市' });
export const GeolocationPage = makeServiceTestPage({ name: 'useGeolocation', hook: () => useGeolocation(), defaultQuery: '' });
export const LocalCityPage = makeServiceTestPage({ name: 'useLocalCity', hook: () => useLocalCity(), defaultQuery: '' });
export const PlaceDetailPage = makeServiceTestPage({ name: 'usePlaceDetail', hook: () => usePlaceDetail({}), defaultQuery: '' });
export const ConvertorPage = makeServiceTestPage({ name: 'useConvertor', hook: () => useConvertor(), defaultQuery: '' });
export const PanoramaServicePage = makeServiceTestPage({ name: 'usePanoramaService', hook: () => usePanoramaService(), defaultQuery: '' });
