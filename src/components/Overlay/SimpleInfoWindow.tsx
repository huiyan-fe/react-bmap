/**
 * SimpleInfoWindow — 简单信息窗口组件（v4+ WebGL only）。
 * SDK: constructor(content, opts)；open: map.openSimpleInfoWindow(iw, point)；close: map.closeSimpleInfoWindow()。
 * 与 InfoWindow 不同，SimpleInfoWindow 是轻量级窗口，没有 maximize/message 等功能。
 */
import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { stableStringify } from '../../utils/stableStringify';
import { tryGetSDK } from '../../utils/sdk';
import type { Point, Size } from '../../types';

export interface SimpleInfoWindowOptions {
  width?: number;
  height?: number;
  maxWidth?: number;
  offset?: Size;
  title?: string;
  maxContent?: string;
  enableMaximize?: boolean;
  enableAutoPan?: boolean;
  enableCloseOnClick?: boolean;
}

export interface SimpleInfoWindowProps extends SimpleInfoWindowOptions {
  position: Point;
  /** 窗口内容（字符串或 HTML） */
  content: string;
  /** 是否打开 */
  open?: boolean;
  /** 事件 */
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: () => void;
}

export const SimpleInfoWindow = memo(function SimpleInfoWindow(props: SimpleInfoWindowProps) {
  const { position, content, open = true, onOpen, onClose, onResize, ...opts } = props;
  const { map, driver } = useMapContext();
  const handleRef = useRef<any>(null);

  // 事件回调用 ref 保持最新引用
  const cbRefs = useRef({ onOpen, onClose, onResize });
  cbRefs.current = { onOpen, onClose, onResize };

  const contentKey = typeof content === 'string' ? content : '';
  const optsKey = stableStringify(opts);

  // 创建 SimpleInfoWindow 实例（content/opts 变化时重建）
  useLayoutEffect(() => {
    if (!map || !driver) return;
    const SDK = tryGetSDK();
    if (!SDK?.SimpleInfoWindow) return;

    // SDK 构造函数：SimpleInfoWindow(content, opts) — content 是第一个参数
    handleRef.current = new SDK.SimpleInfoWindow(content, opts);
    const win = handleRef.current;
    // SDK 构造函数的 setConfig 可能不处理 title/content，用 setter 补设
    if (opts.title && typeof win.setTitle === 'function') win.setTitle(opts.title);
    if (content && typeof win.setContent === 'function') win.setContent(content);
    if (opts.maxContent && typeof win.setMaxContent === 'function') win.setMaxContent(opts.maxContent);

    // 注册事件
    if (typeof win.addEventListener === 'function') {
      win.addEventListener('open', () => cbRefs.current.onOpen?.());
      win.addEventListener('close', () => cbRefs.current.onClose?.());
      win.addEventListener('resize', () => cbRefs.current.onResize?.());
    }

    return () => {
      try { driver.closeSimpleInfoWindow(map); } catch { /* ignore */ }
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, contentKey, optsKey]);

  // open/position 变化时控制显示
  useEffect(() => {
    if (!map || !driver || !handleRef.current) return;
    if (open) {
      driver.openSimpleInfoWindow(map, { __brand: 'OverlayHandle' as const, raw: handleRef.current, type: 'infowindow' }, position);
    } else {
      try { driver.closeSimpleInfoWindow(map); } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, open, position.lng, position.lat, contentKey, optsKey]);

  return null;
});
