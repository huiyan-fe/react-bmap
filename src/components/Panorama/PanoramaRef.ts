/**
 * PanoramaRef — <Panorama> 的命令式句柄，直接包裹原生 Panorama 实例。
 *
 * 与 MapRef 类似，用来在组件外拿到读取类 / 一次性命令类 API：
 * getPosition/getPov/getZoom/getId/getLinks/getVisible/getSceneType/capture 等，
 * 以及 show/hide/enableScrollWheelZoom/setPanoramaPOIType 等命令。
 * 全部对原生方法做 try/catch 兜底，缺方法时安全返回。
 */
import { tryGetSDK } from '../../utils/sdk';
import { debugWarn } from '../../utils/debugWarn';
import type { Point } from '../../types';
import type { PanoramaPOIType, PanoramaSceneType } from '../../constants';

/** 全景视角：heading 水平角（正北 0/正东 90…），pitch 垂直角（可选） */
export interface PanoramaPov {
  heading: number;
  pitch?: number;
}

/** 全景可配置项（对应 SDK PanoramaOptions） */
export interface PanoramaOptions {
  /** 是否显示导航控件，默认 true */
  navigationControl?: boolean;
  /** 是否显示道路指示控件，默认 true */
  linksControl?: boolean;
  /** 是否显示室内场景切换控件（仅室内景生效），默认 true */
  indoorSceneSwitchControl?: boolean;
  /** 是否显示相册控件，默认 false */
  albumsControl?: boolean;
  /** 相册控件配置 */
  albumsControlOptions?: unknown;
}

/** <Panorama> 命令式句柄 */
export interface PanoramaRef {
  getPosition(): Point | null;
  getPov(): PanoramaPov | null;
  getZoom(): number | null;
  getId(): string | null;
  getLinks(): unknown[];
  getVisible(): boolean;
  getSceneType(): PanoramaSceneType | null;
  setPosition(point: Point): void;
  setId(id: string, options?: unknown): void;
  setPov(pov: PanoramaPov, options?: unknown): void;
  setZoom(zoom: number, options?: unknown): void;
  setOptions(options: PanoramaOptions): void;
  setPanoramaPOIType(poiType: PanoramaPOIType): void;
  show(): void;
  hide(): void;
  enableScrollWheelZoom(): void;
  disableScrollWheelZoom(): void;
  capture(options?: { quality?: number; type?: string }): string | undefined;
  clearOverlays(): void;
  /** 原生全景实例逃生舱 */
  raw: unknown;
}

export class PanoramaRefImpl implements PanoramaRef {
  constructor(private pano: any) {}

  get raw(): unknown { return this.pano; }

  getPosition(): Point | null {
    try {
      const p = this.pano?.getPosition?.();
      return p && typeof p.lng === 'number' ? { lng: p.lng, lat: p.lat } : null;
    } catch (e) { debugWarn('PanoramaRef.getPosition', e); return null; }
  }
  getPov(): PanoramaPov | null {
    try {
      const v = this.pano?.getPov?.();
      return v && typeof v.heading === 'number' ? { heading: v.heading, pitch: v.pitch } : null;
    } catch (e) { debugWarn('PanoramaRef.getPov', e); return null; }
  }
  getZoom(): number | null {
    try { const z = this.pano?.getZoom?.(); return typeof z === 'number' ? z : null; }
    catch (e) { debugWarn('PanoramaRef.getZoom', e); return null; }
  }
  getId(): string | null {
    try { return this.pano?.getId?.() ?? null; }
    catch (e) { debugWarn('PanoramaRef.getId', e); return null; }
  }
  getLinks(): unknown[] {
    try { return this.pano?.getLinks?.() ?? []; }
    catch (e) { debugWarn('PanoramaRef.getLinks', e); return []; }
  }
  getVisible(): boolean {
    try { return this.pano?.getVisible?.() ?? false; }
    catch (e) { debugWarn('PanoramaRef.getVisible', e); return false; }
  }
  getSceneType(): PanoramaSceneType | null {
    try { return this.pano?.getSceneType?.() ?? null; }
    catch (e) { debugWarn('PanoramaRef.getSceneType', e); return null; }
  }
  setPosition(point: Point): void {
    try {
      const SDK = tryGetSDK();
      if (SDK?.Point) this.pano?.setPosition?.(new SDK.Point(point.lng, point.lat));
    } catch (e) { debugWarn('PanoramaRef.setPosition', e); }
  }
  setId(id: string, options?: unknown): void {
    try { this.pano?.setId?.(id, options); } catch (e) { debugWarn('PanoramaRef.setId', e); }
  }
  setPov(pov: PanoramaPov, options?: unknown): void {
    try { this.pano?.setPov?.({ heading: pov.heading, pitch: pov.pitch }, options); }
    catch (e) { debugWarn('PanoramaRef.setPov', e); }
  }
  setZoom(zoom: number, options?: unknown): void {
    try { this.pano?.setZoom?.(zoom, options); } catch (e) { debugWarn('PanoramaRef.setZoom', e); }
  }
  setOptions(options: PanoramaOptions): void {
    try { this.pano?.setOptions?.(options); } catch (e) { debugWarn('PanoramaRef.setOptions', e); }
  }
  setPanoramaPOIType(poiType: PanoramaPOIType): void {
    try { this.pano?.setPanoramaPOIType?.(poiType); } catch (e) { debugWarn('PanoramaRef.setPanoramaPOIType', e); }
  }
  show(): void { try { this.pano?.show?.(); } catch (e) { debugWarn('PanoramaRef.show', e); } }
  hide(): void { try { this.pano?.hide?.(); } catch (e) { debugWarn('PanoramaRef.hide', e); } }
  enableScrollWheelZoom(): void { try { this.pano?.enableScrollWheelZoom?.(); } catch (e) { debugWarn('PanoramaRef.enableScrollWheelZoom', e); } }
  disableScrollWheelZoom(): void { try { this.pano?.disableScrollWheelZoom?.(); } catch (e) { debugWarn('PanoramaRef.disableScrollWheelZoom', e); } }
  capture(options?: { quality?: number; type?: string }): string | undefined {
    try { return this.pano?.capture?.(options); } catch (e) { debugWarn('PanoramaRef.capture', e); return undefined; }
  }
  clearOverlays(): void { try { this.pano?.clearOverlays?.(); } catch (e) { debugWarn('PanoramaRef.clearOverlays', e); } }
}
