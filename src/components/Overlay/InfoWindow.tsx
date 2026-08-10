/**
 * InfoWindow — 信息窗口组件。
 *
 * 不是普通 overlay（不走 addOverlay/removeOverlay），而是通过 openInfoWindow/closeInfoWindow 控制。
 *
 * 用法 1：嵌套在 <Marker> 内（自动挂到 marker）
 * <Marker position={pt}>
 *   <InfoWindow open={show}>Hello</InfoWindow>
 * </Marker>
 *
 * 用法 2：独立使用（挂到 map，需传 position）
 * <Map>
 *   <InfoWindow open={show} position={pt}>Hello</InfoWindow>
 * </Map>
 *
 * v3: marker.openInfoWindow(iw) / map.openInfoWindow(iw, point)
 * v4: marker.openInfoWindow(iw) / map.openInfoWindow 已移除
 */
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useOverlayTarget } from '../../context/OverlayTargetContext';
import { stableStringify } from '../../utils/stableStringify';
import type { OverlayHandle, Point } from '../../types';
import type { InfoWindowProps } from './types';

export const InfoWindow = memo(function InfoWindow(props: InfoWindowProps) {
  const { map, driver } = useMapContext();
  const target = useOverlayTarget();

  const {
    content, open = true, position,
    onOpen, onClose, onClickClose, onMaximize, onRestore, onResize,
    width, height, maxWidth, offset, title,
    enableAutoPan, enableCloseOnClick, enableMessage, message, maxContent, enableMaximize,
  } = props;

  const iwRef = useRef<OverlayHandle | null>(null);
  const [created, setCreated] = useState(false);

  // 用 ref 存所有事件回调，SDK 监听器只注册一次、不随 render 重新绑定
  const cbRefs = {
    open: useRef(onOpen), close: useRef(onClose), clickclose: useRef(onClickClose),
    maximize: useRef(onMaximize), restore: useRef(onRestore), resize: useRef(onResize),
  };
  cbRefs.open.current = onOpen;
  cbRefs.close.current = onClose;
  cbRefs.clickclose.current = onClickClose;
  cbRefs.maximize.current = onMaximize;
  cbRefs.restore.current = onRestore;
  cbRefs.resize.current = onResize;

  // 有 setter 的属性通过 setter 更新，不重建
  // 无 setter 的属性变化才重建：maxWidth, offset, enableCloseOnClick, enableMessage, message
  const ctorOnlyOptsKey = stableStringify({ maxWidth, offset, enableCloseOnClick, enableMessage, message });

  // 1. 创建 InfoWindow 实例（仅 ctor-only 属性变化时重建）
  useLayoutEffect(() => {
    if (!driver) return;
    const opts: Record<string, unknown> = {};
    const raw = { width, height, maxWidth, offset, title, enableAutoPan, enableCloseOnClick, enableMessage, message, maxContent, enableMaximize };
    for (const [k, v] of Object.entries(raw)) {
      if (v !== undefined && v !== null) opts[k] = v;
    }
    const iw = driver.createInfoWindow(content, opts);
    if (!iw) return;
    iwRef.current = iw;
    setCreated(true);

    // 注册全部 6 个 InfoWindowEventMap 事件，通过 ref 调用最新回调
    const rawIW = (iw as any).raw;
    const handlers: { event: string; fn: (e: unknown) => void }[] = [];
    for (const [event, refKey] of [
      ['open', 'open'], ['close', 'close'], ['clickclose', 'clickclose'],
      ['maximize', 'maximize'], ['restore', 'restore'], ['resize', 'resize'],
    ] as const) {
      const fn = (e: unknown) => (cbRefs as any)[refKey].current?.(e);
      rawIW?.addEventListener?.(event, fn);
      handlers.push({ event, fn });
    }

    return () => {
      for (const { event, fn } of handlers) {
        rawIW?.removeEventListener?.(event, fn);
      }
      const openTarget = target?.target ?? map;
      if (openTarget) {
        try { driver.closeInfoWindow(openTarget as any); } catch { /* ignore */ }
      }
      iwRef.current = null;
      setCreated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, ctorOnlyOptsKey]);

  // 2. 有 setter 的属性：变化时调 setter，不重建
  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (raw && content != null) raw.setContent?.(content);
  }, [created, content]);

  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (raw && title != null) raw.setTitle?.(title);
  }, [created, title]);

  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (raw && width != null) raw.setWidth?.(width);
  }, [created, width]);

  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (raw && height != null) raw.setHeight?.(height);
  }, [created, height]);

  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (raw && maxContent != null) raw.setMaxContent?.(maxContent);
  }, [created, maxContent]);

  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (!raw) return;
    if (enableMaximize === true) raw.enableMaximize?.();
    else if (enableMaximize === false) raw.disableMaximize?.();
  }, [created, enableMaximize]);

  useEffect(() => {
    const raw = (iwRef.current as any)?.raw;
    if (!raw) return;
    if (enableAutoPan === true) raw.enableAutoPan?.();
    else if (enableAutoPan === false) raw.disableAutoPan?.();
  }, [created, enableAutoPan]);

  // 3. open/close 控制（不依赖 content/opts，避免属性变化时重新打开）
  useEffect(() => {
    if (!driver || !map || !created || !iwRef.current) return;

    const openTarget = (target?.target ?? map) as any;
    const iw = iwRef.current;

    if (open) {
      try {
        const rawTarget = openTarget?.raw ?? openTarget;
        const rawIW = (iw as any).raw;

        if (position) {
          const SDK = (globalThis as any).BMap;
          const pt = new SDK.Point(position.lng, position.lat);
          rawTarget?.openInfoWindow?.(rawIW, pt);
        } else if (typeof rawTarget?.openInfoWindow === 'function') {
          rawTarget.openInfoWindow(rawIW);
        }
      } catch (e) {
        console.warn('[InfoWindow] open failed:', e);
      }
    } else {
      try {
        const rawTarget = openTarget?.raw ?? openTarget;
        if (typeof rawTarget?.closeInfoWindow === 'function') rawTarget.closeInfoWindow();
        else (map as any).raw?.closeInfoWindow?.();
      } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, map, target, created, open, position?.lng, position?.lat, ctorOnlyOptsKey]);

  // InfoWindow 不渲染 React children 到 DOM（内容通过 SDK content 参数传入）
  // children 仅用于逻辑组合（如嵌套在 Marker 内时提供 OverlayTargetContext）
  return null;
});
