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
    content, open = true, position, onClose,
    width, height, maxWidth, offset, title,
    enableAutoPan, enableCloseOnClick, enableMessage, message, maxContent, enableMaximize,
  } = props;

  const iwRef = useRef<OverlayHandle | null>(null);
  const [created, setCreated] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // 1. 创建 InfoWindow 实例（mount 时创建一次）
  const contentKey = stableStringify(content);
  const optsKey = stableStringify({ width, height, maxWidth, offset, title, enableAutoPan, enableCloseOnClick, enableMessage, message, maxContent, enableMaximize });

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

    return () => {
      // cleanup: close if open
      const openTarget = target?.target ?? map;
      if (openTarget) {
        try { driver.closeInfoWindow(openTarget as any); } catch { /* ignore */ }
      }
      iwRef.current = null;
      setCreated(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, contentKey, optsKey]);

  // 2. open/close 控制
  useEffect(() => {
    if (!driver || !map || !created || !iwRef.current) return;

    const openTarget = (target?.target ?? map) as any;
    const iw = iwRef.current;

    if (open) {
      try {
        // 直调 raw SDK，绕过 driver 版本检测
        const rawTarget = openTarget?.raw ?? openTarget;
        const rawIW = (iw as any).raw;

        if (typeof rawTarget?.openInfoWindow === 'function') {
          // marker.openInfoWindow(iw) — v3/v4
          rawTarget.openInfoWindow(rawIW);
        } else if (position) {
          // map.openInfoWindow(iw, point) — v3 fallback
          const SDK = (globalThis as any).BMap;
          const pt = new SDK.Point(position.lng, position.lat);
          rawTarget?.openInfoWindow?.(rawIW, pt);
        }

        // 监听 SDK close 事件（用户点 X 关闭时同步 state）
        rawIW?.addEventListener?.('close', () => onCloseRef.current?.());
        const rawMap = (map as any).raw;
        rawMap?.addEventListener?.('infowindowclose', () => onCloseRef.current?.());
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
  }, [driver, map, target, created, open, position?.lng, position?.lat]);

  // InfoWindow 不渲染 React children 到 DOM（内容通过 SDK content 参数传入）
  // children 仅用于逻辑组合（如嵌套在 Marker 内时提供 OverlayTargetContext）
  return null;
});
