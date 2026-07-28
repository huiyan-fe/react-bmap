/**
 * PlaceDetail — 地点详情组件（v4+）。
 *
 * 用法：嵌套在 <Marker> 内，通过 `open` prop 控制。
 *
 * ```tsx
 * <Marker position={pt}>
 *   <PlaceDetail uid="06d2dffda107b0ef89f15db6" open={show} />
 * </Marker>
 * ```
 *
 * 实现要点：
 * - 创建 PlaceDetail 服务实例（需要 container DOM，内部自动创建隐藏 div）
 * - setData(uid) 设置 POI 数据
 * - open=true → marker.openPlaceDetail(pd)
 * - open=false → marker.closePlaceDetail()
 * - v4+ only；v3 下 supported=false，组件 noop
 */
import { memo, useLayoutEffect, useRef, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useOverlayTarget } from '../../context/OverlayTargetContext';
import type { ServiceHandle } from '../../types';

export interface PlaceDetailRenderOptions {
  displayCarousel?: boolean;
  displayTag?: boolean;
  displayRating?: boolean;
  displayPrice?: boolean;
  displayBangdan?: boolean;
  displayTradeTag?: boolean;
  displayShopHours?: boolean;
  displayContactInformation?: boolean;
  contactInformationCount?: number;
  displayAddress?: boolean;
  displayComment?: boolean;
  displayCommentTotalCount?: boolean;
}

export interface PlaceDetailOptions {
  renderOptions?: PlaceDetailRenderOptions;
  /** 紧凑模式（地图内 overlay 展示时自动启用） */
  compact?: boolean;
}

export interface PlaceDetailProps {
  /** POI uid（百度地图地点唯一标识） */
  uid: string;
  /** 受控：true=打开, false=关闭。不传则 mount 时自动打开 */
  open?: boolean;
  /** PlaceDetailOptions 透传 */
  options?: PlaceDetailOptions;
  children?: React.ReactNode;
}

export const PlaceDetail = memo(function PlaceDetail(props: PlaceDetailProps) {
  const { driver } = useMapContext();
  const target = useOverlayTarget();
  const { uid, open = true, options } = props;

  const pdRef = useRef<ServiceHandle | null>(null);

  // 创建 PlaceDetail 实例（mount 时一次）
  const optsKey = JSON.stringify(options ?? {});
  useLayoutEffect(() => {
    if (!driver) return;
    const container = document.createElement('div');
    const pd = driver.createPlaceDetail({ container, ...options });
    if (!pd || (pd as any).isNull) {
      if (typeof console !== 'undefined') {
        console.warn('[react-bmap] PlaceDetail not supported in this JSAPI version (requires 4.0+)');
      }
      return;
    }
    pdRef.current = pd;
    return () => {
      const raw = (pdRef.current as any)?.raw;
      raw?.dispose?.();
      pdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, optsKey]);

  // uid 变化时 setData
  useEffect(() => {
    if (!driver || !pdRef.current) return;
    const raw = (pdRef.current as any).raw;
    raw?.setData?.(uid);
  }, [driver, uid]);

  // open/close 控制（需要父 Marker）
  const targetHandle = target?.target ?? null;
  useEffect(() => {
    if (!driver || !targetHandle || !pdRef.current) return;
    if (open) {
      driver.openPlaceDetail(targetHandle as any, pdRef.current);
    } else {
      driver.closePlaceDetail(targetHandle as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, targetHandle, open, uid]);

  // PlaceDetail 不渲染 React children 到 DOM（内容通过 SDK overlay 渲染）
  return null;
});
