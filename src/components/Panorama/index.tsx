/**
 * Panorama + PanoramaLabel 组件。
 *
 * - <Panorama> 独立容器，创建 Panorama 实例，不在 <Map> 内也可使用
 * - <PanoramaLabel> 是全景标注，必须作为 <Panorama> 子组件
 * - point/id 变化通过 setPosition/setId 响应式更新；pov/zoom/options/visible/滚轮/poiType 亦可运行时受控
 * - 事件：onPositionChange/onPovChange/onLinksChange/onZoomChange/onClick/onDblClick/onLinkClick/onIdChange/onSceneTypeChange/onError/onDataLoad
 * - 命令式：通过 ref 拿 PanoramaRef，可调 getPosition/getPov/getZoom/getId/getLinks/getSceneType/capture 等
 */
import { memo, forwardRef, useLayoutEffect, useRef, useState, useMemo, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useBMapContext } from '../../context/BMapContext';
import { debugWarn } from '../../utils/debugWarn';
import { tryGetSDK } from '../../utils/sdk';
import { createContext, useContext } from 'react';
import type { MapHandle, Point } from '../../types';
import type { PanoramaPOIType } from '../../constants';
import { PanoramaRefImpl } from './PanoramaRef';
import type { PanoramaRef, PanoramaPov, PanoramaOptions } from './PanoramaRef';

export type { PanoramaRef, PanoramaPov, PanoramaOptions } from './PanoramaRef';

// Panorama Context（给 PanoramaLabel 用）
const PanoramaContext = createContext<MapHandle | null>(null);

export interface PanoramaProps {
  point?: Point;
  /** 通过全景 id 展示（与 point 二选一；两者都给时按各自 effect 分别调用） */
  id?: string;
  /** 全景视角（heading 必填，pitch 可选） */
  pov?: PanoramaPov;
  /** 缩放级别 */
  zoom?: number;
  /** 全景配置：导航/道路/室内切换/相册控件（2.0.2 新增） */
  options?: PanoramaOptions;
  /** 显隐控制：true→show()，false→hide()（2.0.2 新增） */
  visible?: boolean;
  /** 鼠标滚轮缩放开关（2.0.2 新增） */
  enableScrollWheelZoom?: boolean;
  /** 外景场景点内可见的 POI 类型（2.0.2 新增） */
  poiType?: PanoramaPOIType;
  style?: CSSProperties;
  className?: string;
  children?: React.ReactNode;
  /** 全景位置变化回调（position_changed） */
  onPositionChange?: (point: Point) => void;
  /** 视角变化回调（pov_changed） */
  onPovChange?: () => void;
  /** 相邻道路数据变化回调（links_changed，2.0.2 新增） */
  onLinksChange?: () => void;
  /** 缩放级别变化回调（zoom_changed，2.0.2 新增） */
  onZoomChange?: (zoom: number) => void;
  /** 单击全景画面（click，2.0.2 新增） */
  onClick?: (e: unknown) => void;
  /** 双击全景画面（dblclick，2.0.2 新增） */
  onDblClick?: (e: unknown) => void;
  /** 单击道路链接（link_click，2.0.2 新增） */
  onLinkClick?: (e: unknown) => void;
  /** 全景 id 变化（id_changed，2.0.2 新增） */
  onIdChange?: (id: string) => void;
  /** 场景类型变化（scene_type_changed，2.0.2 新增） */
  onSceneTypeChange?: () => void;
  /** 全景数据加载失败（pano_error，2.0.2 新增） */
  onError?: (e: unknown) => void;
  /** 全景数据加载完成（dataload，2.0.2 新增） */
  onDataLoad?: (e: unknown) => void;
}

export const Panorama = memo(forwardRef<PanoramaRef, PanoramaProps>(function Panorama(props, ref) {
  const { point, id, pov, zoom, options, visible, enableScrollWheelZoom, poiType, style, className, children } = props;
  const { driver, status } = useBMapContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pano, setPano] = useState<MapHandle | null>(null);
  // 事件回调 + 初始 options 用 ref 持有，避免进创建 effect 依赖导致重建
  const cbRefs = useRef(props);
  cbRefs.current = props;

  // 创建全景实例
  useLayoutEffect(() => {
    if (status !== 'ready' || !driver || !containerRef.current) return;
    const handle = driver.createPanorama(containerRef.current, cbRefs.current.options ?? {});
    if (!handle) return;
    setPano(handle);

    const raw = (handle as any).raw;
    if (raw && typeof raw.addEventListener === 'function') {
      raw.addEventListener('position_changed', (e: any) => {
        const pt = e?.point || e?.latlng || e?.latLng || e?.data?.point || e?.data?.latlng || e?.data?.latLng;
        if (pt && typeof pt.lng === 'number') {
          cbRefs.current.onPositionChange?.({ lng: pt.lng, lat: pt.lat });
        } else if (typeof raw.getPosition === 'function') {
          try {
            const pos = raw.getPosition();
            if (pos && typeof pos.lng === 'number') {
              cbRefs.current.onPositionChange?.({ lng: pos.lng, lat: pos.lat });
            }
          } catch { /* ignore */ }
        }
      });
      raw.addEventListener('pov_changed', () => cbRefs.current.onPovChange?.());
      raw.addEventListener('links_changed', () => cbRefs.current.onLinksChange?.());
      raw.addEventListener('zoom_changed', () => {
        let z: number | undefined;
        try { z = raw.getZoom?.(); } catch { /* ignore */ }
        cbRefs.current.onZoomChange?.(z as number);
      });
      raw.addEventListener('click', (e: any) => cbRefs.current.onClick?.(e));
      raw.addEventListener('dblclick', (e: any) => cbRefs.current.onDblClick?.(e));
      raw.addEventListener('link_click', (e: any) => cbRefs.current.onLinkClick?.(e));
      raw.addEventListener('id_changed', (e: any) => {
        let curId: string | undefined = typeof e === 'string' ? e : undefined;
        if (curId === undefined) { try { curId = raw.getId?.(); } catch { /* ignore */ } }
        cbRefs.current.onIdChange?.(curId as string);
      });
      raw.addEventListener('scene_type_changed', () => cbRefs.current.onSceneTypeChange?.());
      raw.addEventListener('pano_error', (e: any) => cbRefs.current.onError?.(e));
      raw.addEventListener('dataload', (e: any) => cbRefs.current.onDataLoad?.(e));
    }

    return () => {
      driver.destroyPanorama(handle);
      setPano(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, status]);

  // 命令式句柄：pano 就绪时把原生实例包成 PanoramaRef 暴露给 ref
  useEffect(() => {
    if (!ref) return;
    const raw = pano ? (pano as any).raw : null;
    const instance = raw ? new PanoramaRefImpl(raw) : null;
    if (typeof ref === 'function') ref(instance);
    else (ref as React.MutableRefObject<PanoramaRef | null>).current = instance;
  }, [pano, ref]);

  // point → setPosition
  useEffect(() => {
    if (!pano || !point) return;
    const raw = (pano as any).raw;
    const SDK = tryGetSDK();
    if (raw && SDK?.Point) {
      try { raw.setPosition?.(new SDK.Point(point.lng, point.lat)); }
      catch (e) { debugWarn('Panorama.setPosition', e); }
    }
  }, [pano, point?.lng, point?.lat]);

  // id → setId
  useEffect(() => {
    if (!pano || !id) return;
    const raw = (pano as any).raw;
    try { raw?.setId?.(id); }
    catch (e) { debugWarn('Panorama.setId', e); }
  }, [pano, id]);

  // pov → setPov
  useEffect(() => {
    if (!pano || !pov) return;
    const raw = (pano as any).raw;
    try { raw?.setPov?.({ heading: pov.heading, pitch: pov.pitch }); }
    catch (e) { debugWarn('Panorama.setPov', e); }
  }, [pano, pov?.heading, pov?.pitch]);

  // zoom → setZoom
  useEffect(() => {
    if (!pano || zoom == null) return;
    const raw = (pano as any).raw;
    try { raw?.setZoom?.(zoom); }
    catch (e) { debugWarn('Panorama.setZoom', e); }
  }, [pano, zoom]);

  // options → setOptions（首帧构造时已应用一次，这里响应后续变化；重复应用同值无副作用）
  const optionsKey = useMemo(() => (options ? JSON.stringify(options) : ''), [options]);
  useEffect(() => {
    if (!pano || !options) return;
    const raw = (pano as any).raw;
    // SDK 坑：albumsControl:false 与 albumsControlOptions 一起下发时，相册控件的 setOptions
    // 末尾会 renderByPid 把相册重新渲染出来，导致「隐藏」失效。故关闭相册时剔除 albumsControlOptions。
    let toApply: PanoramaOptions = options;
    if (options.albumsControl === false && options.albumsControlOptions !== undefined) {
      const { albumsControlOptions: _drop, ...rest } = options;
      void _drop;
      toApply = rest;
    }
    try { raw?.setOptions?.(toApply); }
    catch (e) { debugWarn('Panorama.setOptions', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pano, optionsKey]);

  // visible → show / hide
  useEffect(() => {
    if (!pano || visible === undefined) return;
    const raw = (pano as any).raw;
    try { if (visible) raw?.show?.(); else raw?.hide?.(); }
    catch (e) { debugWarn('Panorama.visible', e); }
  }, [pano, visible]);

  // enableScrollWheelZoom → enable/disableScrollWheelZoom
  useEffect(() => {
    if (!pano || enableScrollWheelZoom === undefined) return;
    const raw = (pano as any).raw;
    try { if (enableScrollWheelZoom) raw?.enableScrollWheelZoom?.(); else raw?.disableScrollWheelZoom?.(); }
    catch (e) { debugWarn('Panorama.enableScrollWheelZoom', e); }
  }, [pano, enableScrollWheelZoom]);

  // poiType → setPanoramaPOIType
  useEffect(() => {
    if (!pano || !poiType) return;
    const raw = (pano as any).raw;
    try { raw?.setPanoramaPOIType?.(poiType); }
    catch (e) { debugWarn('Panorama.setPanoramaPOIType', e); }
  }, [pano, poiType]);

  const ctxVal = useMemo(() => pano, [pano]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {ctxVal && <PanoramaContext.Provider value={ctxVal}>{children}</PanoramaContext.Provider>}
    </div>
  );
}));

export interface PanoramaLabelProps {
  position: Point;
  altitude?: number;
  content?: string;
  /** 是否显示标签到当前全景场景点的距离，默认 true（2.0.2 新增） */
  displayDistance?: boolean;
  /** 自定义标签 css 样式（2.0.2 新增） */
  customStyle?: CSSProperties;
  /** 点击标注回调（2.0.2 新增） */
  onClick?: (e: unknown) => void;
  children?: React.ReactNode;
}

export const PanoramaLabel = memo(function PanoramaLabel(props: PanoramaLabelProps) {
  const { driver } = useBMapContext();
  const pano = useContext(PanoramaContext);
  const labelRef = useRef<unknown>(null);
  const onClickRef = useRef(props.onClick);
  onClickRef.current = props.onClick;

  const labelKey = useMemo(
    () => JSON.stringify([props.position, props.altitude, props.content, props.displayDistance, props.customStyle]),
    [props.position, props.altitude, props.content, props.displayDistance, props.customStyle],
  );

  useLayoutEffect(() => {
    if (!driver || !pano) return;
    // createPanoramaLabel 内部拆分参数：PanoramaLabel(content, {position, altitude, displayDistance, customStyle})
    const label = driver.createPanoramaLabel(props);
    if (!label) return;
    labelRef.current = label;
    const rawLabel = (label as any).raw;
    const rawPano = (pano as any).raw;
    if (rawPano && typeof rawPano.addOverlay === 'function') {
      rawPano.addOverlay(rawLabel);
    }
    // 点击事件：通过 ref 调最新 handler，换 handler 不必重建
    const clickHandler = (e: unknown) => onClickRef.current?.(e);
    if (rawLabel && typeof rawLabel.addEventListener === 'function') {
      rawLabel.addEventListener('click', clickHandler);
    }
    return () => {
      if (rawLabel && typeof rawLabel.removeEventListener === 'function') {
        rawLabel.removeEventListener('click', clickHandler);
      }
      if (rawPano && typeof rawPano.removeOverlay === 'function') {
        rawPano.removeOverlay(rawLabel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, pano, labelKey]);

  return null;
});
