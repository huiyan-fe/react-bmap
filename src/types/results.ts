/**
 * 服务结果类型 — 对照 bmap-jsapi-dts/src/service/*.d.ts。
 * 用户从 useLocalSearch/useDrivingRoute 等 Hook 拿到的 data 类型。
 */
import type { Point, Bounds } from '../types';

// ─── LocalSearch ───
export interface LocalResultPoi { title: string; point: Point; address: string; phoneNumber: string; tags?: string[]; url?: string; }
export interface LocalResult { keyword: string; getCurrentNumPois(): number; getPoi(i: number): LocalResultPoi; getNumPois(): number; getNumPages(): number; getCurrentPage(): number; city: string; }

// ─── Geocoder ───
export interface AddressComponent { province: string; city: string; district: string; street: string; streetNumber: string; }
export interface GeocoderResult { point: Point; address: string; addressComponents: AddressComponent; surroundingPoi?: LocalResultPoi[]; business: string; }

// ─── Driving / Walking / Riding Route ───
export interface Step { point: Point; distance: number; duration: number; instructions: string; }
export interface Route { getDistance(includeTraffic?: boolean): { value: number; }; getNumSteps(): number; getStep(i: number): Step; getPath(): Point[]; }
export interface RoutePlan { getNumRoutes(): number; getRoute(i: number): Route; getDistance(includeTraffic?: boolean): { value: number; }; getDuration(includeTraffic?: boolean): { value: number; }; }
export interface DrivingRouteResult { policy?: number; taxiFare?: TaxiFare; getNumPlans(): number; getPlan(i: number): RoutePlan; }
export type WalkingRouteResult = DrivingRouteResult;
export type RidingRouteResult = DrivingRouteResult;

// ─── TransitRoute ───
export interface TransitLine { title: string; getNumStops?(): number; }
export interface TransitPlan { getNumLines(): number; getLine(i: number): TransitLine; getDistance(includeTraffic?: boolean): { value: number; }; getDuration(includeTraffic?: boolean): { value: number; }; }
export interface TransitRouteResult { policy?: number; getNumPlans(): number; getPlan(i: number): TransitPlan; }

// ─── BusLineSearch ───
export interface BusStation { name: string; point: Point; }
export interface BusLine { name: string; uid?: string; getNumStations?(): number; }
export interface BusListItem { uid?: string; name: string; }
export interface BusListResult { getNumBusList(): number; getBusListItem(i: number): BusListItem; }

// ─── Autocomplete ───
export interface AutocompleteResultPoi { business?: string; city?: string; district?: string; uid?: string; address?: string; point?: Point; }
export interface AutocompleteResult { getList?(): AutocompleteResultPoi[] }

// ─── Geolocation ───
export interface GeolocationResult { point: Point; accuracy?: number; address?: string; }

// ─── LocalCity ───
export interface LocalCityResult { center: Point; level: number; name: string; code?: number; }

// ─── Convertor ───
export interface TranslateResults { status?: number; points?: Point[]; size?(): number; }

// ─── TaxiFare ───
export interface TaxiFareDetail { day?: { totalPrice?: number; distance?: number; duration?: number; detail?: unknown; }; night?: { totalPrice?: number; distance?: number; duration?: number; detail?: unknown; }; }
export interface TaxiFare { distance: number; duration: number; detail: TaxiFareDetail; }

// ─── PanoramaService ───
export interface PanoramaData { id?: string; links?: unknown[]; pov?: { heading?: number; pitch?: number; zoom?: number }; }

// ─── RenderOptions ───
export interface RenderOptions { map?: unknown; panel?: string | HTMLElement; selectFirstResult?: boolean; autoViewport?: boolean; highlightMode?: number; viewportOptions?: ViewportOptions; }
export interface ViewportOptions { margins?: number[]; zoomFactor?: number; }
