import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from 'react';
import { z } from 'zod';
import { BMapMapContextProvider } from '../../context/BMapContext';
import { useBMapLoader } from '../../context/BMapProvider';
import { getOptions } from '../../hooks/useGetOptions';
import { isString } from '../../utils/common';
import type { MapApiType, BMapApi, BMapGLApi } from '../../types';
import { PointLikeSchema, MapApiTypeSchema } from '../../schemas';

const MAP_EVENTS = [
  'click', 'dblclick', 'rightclick', 'rightdblclick', 'maptypechange',
  'mousemove', 'mouseover', 'mouseout', 'movestart', 'moving', 'moveend',
  'zoomstart', 'zoomend', 'addoverlay', 'addcontrol', 'removecontrol',
  'removeoverlay', 'clearoverlays', 'dragstart', 'dragging', 'dragend',
  'addtilelayer', 'removetilelayer', 'load', 'resize', 'hotspotclick',
  'hotspotover', 'hotspotout', 'tilesloaded', 'touchstart', 'touchmove',
  'touchend', 'longpress',
] as const;

const TOGGLE_METHODS = {
  enableScrollWheelZoom: ['enableScrollWheelZoom', 'disableScrollWheelZoom'],
  enableDragging: ['enableDragging', 'disableDragging'],
  enableDoubleClickZoom: ['enableDoubleClickZoom', 'disableDoubleClickZoom'],
  enableKeyboard: ['enableKeyboard', 'disableKeyboard'],
  enableInertialDragging: ['enableInertialDragging', 'disableInertialDragging'],
  enableContinuousZoom: ['enableContinuousZoom', 'disableContinuousZoom'],
  enablePinchToZoom: ['enablePinchToZoom', 'disablePinchToZoom'],
  enableAutoResize: ['enableAutoResize', 'disableAutoResize'],
};

const MAP_OPTIONS = ['minZoom', 'maxZoom', 'mapType', 'enableMapClick'];

export const MapPropsSchema = z.object({
  center: z
    .union([PointLikeSchema, z.string()])
    .optional()
    .describe('地图中心点，支持坐标对象或城市名'),
  zoom: z.number().optional().describe('缩放级别'),
  style: z.record(z.string(), z.any()).optional().describe('容器样式'),
  className: z.string().optional().describe('容器类名'),
  keys: z.union([z.string(), z.number()]).optional(),
  forceUpdate: z.boolean().optional(),
  enableMapClick: z.boolean().optional().describe('是否启用地图点击'),
  minZoom: z.number().optional(),
  maxZoom: z.number().optional(),
  mapType: z.any().optional(),
  mapStyle: z.any().optional().describe('地图样式'),
  mapStyleV2: z.any().optional().describe('地图样式 V2'),
  events: z.any().optional().describe('地图事件'),
  zoom_changed: z.function().optional().describe('缩放变化回调'),
  render: z.function().optional().describe('自定义渲染函数'),
  apiType: MapApiTypeSchema.optional().describe('地图 API 类型：default 或 gl'),
  enableScrollWheelZoom: z.boolean().optional(),
  enableDragging: z.boolean().optional(),
  enableDoubleClickZoom: z.boolean().optional(),
  enableKeyboard: z.boolean().optional(),
  enableInertialDragging: z.boolean().optional(),
  enableContinuousZoom: z.boolean().optional(),
  enablePinchToZoom: z.boolean().optional(),
  enableAutoResize: z.boolean().optional(),
});

export type MapProps = z.infer<typeof MapPropsSchema> & {
  children?: React.ReactNode;
  [key: string]: any;
};

/**
 * Resolve map API type:
 * 1. Manual apiType has highest priority
 * 2. Otherwise infer from loader context (apiType from loaded version)
 * 3. Finally infer from global namespace (backward compat with <script> loading)
 *    - BMapGL exists → gl
 *    - BMap exists → default
 *    - Both exist → default gl
 */
function resolveApiType(
  apiType: MapApiType | undefined,
  loaderApiType: MapApiType | undefined
): MapApiType {
  if (apiType === 'gl' || apiType === 'default') return apiType;
  if (loaderApiType === 'gl' || loaderApiType === 'default') return loaderApiType;
  const hasGL = typeof BMapGL !== 'undefined';
  const hasDefault = typeof BMap !== 'undefined';
  if (hasGL) return 'gl';
  if (hasDefault) return 'default';
  return 'default'; // fallback when neither loaded
}

function getBMapApi(apiType: MapApiType, loaderApi?: BMapApi | BMapGLApi): BMapApi | BMapGLApi {
  if (loaderApi) return loaderApi;
  if (apiType === 'gl' && typeof BMapGL !== 'undefined') return BMapGL;
  return BMap;
}

const MapInner = forwardRef<any, MapProps & { children?: React.ReactNode }>(
  (props, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [mapReady, setMapReady] = useState(false);
    const loaderCtx = useBMapLoader();
    const apiType = resolveApiType(props.apiType, loaderCtx?.apiType);
    const B = getBMapApi(apiType, loaderCtx?.api);

    useImperativeHandle(ref, () => ({
      get map() {
        return mapInstanceRef.current;
      },
    }), []);

    useEffect(() => {
      const wrapper = mapRef.current;
      if (!wrapper) return;

      // 每次 mount 创建全新容器，避免 BMapGL 在 destroy 后无法在同一容器上重新初始化
      // React 18 Strict Mode 会 mount -> unmount -> mount，必须使用新容器才能正确显示
      const container = document.createElement('div');
      container.className = props.className || '';
      container.style.height = '100%';
      wrapper.appendChild(container);

      const mapOptions = getOptions(props, MAP_OPTIONS) as any;
      if (props.enableMapClick !== true) {
        mapOptions.enableMapClick = false;
      }

      let cancelled = false;
      let map: any = null;
      let eventsObj: Record<string, (e: any) => void> = {};
      let zoomHandler: (() => void) | null = null;

      const doCleanup = () => {
        if (map) {
          if (zoomHandler) map.removeEventListener?.('zoomend', zoomHandler);
          Object.keys(eventsObj).forEach((evt) => {
            map.removeEventListener?.(evt, eventsObj[evt]);
          });
          mapInstanceRef.current = null;
          (map as { destroy?: () => void }).destroy?.();
        }
        if (container.parentNode) container.remove();
        setMapReady(false);
      };

      const doInit = () => {
        if (cancelled) return;
        map = new B.Map(container, mapOptions);
        mapInstanceRef.current = map;

        eventsObj = {};
        if (props.events) {
          MAP_EVENTS.forEach((evt) => {
            const handler = (props.events as any)[evt];
            if (handler) eventsObj[evt] = handler;
          });
        }
        Object.keys(eventsObj).forEach((evt) => {
          map.addEventListener(evt, eventsObj[evt]);
        });

        const zoom = props.zoom;
        if (isString(props.center)) {
          map.centerAndZoom(props.center, zoom && zoom > 3 ? zoom : undefined);
        } else if (props.center) {
          const pt = new B.Point(props.center.lng, props.center.lat);
          map.centerAndZoom(pt, zoom ?? 5);
        }

        if (props.mapStyleV2) {
          map.setMapStyleV2?.(props.mapStyleV2);
        } else if (props.mapStyle) {
          map.setMapStyle?.(props.mapStyle);
        }

        Object.entries(TOGGLE_METHODS).forEach(([key, [enable, disable]]) => {
          if (props[key] !== undefined) {
            map[props[key] ? enable : disable]?.();
          }
        });

        let lastZoom = zoom;
        zoomHandler = () => {
          const z = map.getZoom();
          props.zoom_changed?.(z, lastZoom);
          lastZoom = z;
        };
        map.addEventListener('zoomend', zoomHandler);

        if (cancelled) {
          doCleanup();
          return;
        }
        setMapReady(true);
      };

      // BMapGL 需延迟初始化：destroy() 后 WebGL 上下文释放是异步的，
      // Strict Mode 快速 remount 时立即创建会失败，需等待下一帧让上下文释放
      if (apiType === 'gl') {
        const rafId = requestAnimationFrame(() => {
          requestAnimationFrame(doInit);
        });
        return () => {
          cancelled = true;
          cancelAnimationFrame(rafId);
          doCleanup();
        };
      }

      doInit();

      return () => {
        cancelled = true;
        doCleanup();
      };
    }, []);

    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !mapReady) return;

      const center = props.center;
      const zoom = props.zoom;

      if (isString(center)) {
        map.centerAndZoom(center, zoom && zoom > 3 ? zoom : undefined);
      } else if (center && typeof center === 'object') {
        const pt = new B.Point(center.lng, center.lat);
        if (props.forceUpdate || true) {
          map.centerAndZoom(pt, zoom ?? map.getZoom());
        } else {
          map.setCenter(pt);
          if (zoom !== undefined) map.zoomTo(zoom);
        }
      }
    }, [mapReady, props.center, props.zoom, props.forceUpdate]);

    const contextValue = useMemo(
      () =>
        mapInstanceRef.current
          ? {
              map: mapInstanceRef.current,
              api: B,
              apiType,
            }
          : null,
      [mapReady, apiType]
    );

    const style: React.CSSProperties = {
      height: '100%',
      position: 'relative',
      ...props.style,
    };

    return (
      <div style={style} key={props.keys}>
        {!mapReady && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f5f5f5',
            }}
          >
            加载地图中...
          </div>
        )}
        <div ref={mapRef} className={props.className} style={{ height: '100%' }} />
        {mapReady && contextValue && (
          <BMapMapContextProvider value={contextValue}>
            <MapChildren
              contextValue={contextValue}
              render={props.render}
              children={props.children}
            />
          </BMapMapContextProvider>
        )}
      </div>
    );
  }
);

function MapChildren({
  children,
  render,
  contextValue,
}: {
  children?: React.ReactNode;
  render?: (map: any) => React.ReactNode;
  contextValue: { map: any };
}) {
  const map = contextValue.map;
  const rendered = React.Children.map(children, (child) => {
    if (!child || typeof (child as any)?.type === 'string') return child;
    return React.cloneElement(child as React.ReactElement<any>, { map });
  });

  return (
    <>
      {rendered}
      {render?.(map)}
    </>
  );
}

MapInner.displayName = 'Map';

export const Map = forwardRef<any, MapProps & { children?: React.ReactNode }>(
  (props, ref) => {
    const defaultStyle = { height: '350px' };
    return (
      <MapInner
        ref={ref}
        {...props}
        style={{ ...defaultStyle, ...props.style }}
      />
    );
  }
);

Map.displayName = 'Map';

export default Map;
