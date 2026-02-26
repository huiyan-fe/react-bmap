import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { createRoot } from 'react-dom/client';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';
import { createCustomOverlay } from './createCustomOverlay';
import { createIcons } from './createIcons';
import { MarkerOrderTip } from './MarkerOrderTip';
import { PointLikeSchema } from '../../schemas';

const MARKER_OPTIONS = [
  'offset',
  'icon',
  'enableMassClear',
  'enableDragging',
  'enableClicking',
  'raiseOnDrag',
  'draggingCursor',
  'rotation',
  'shadow',
  'title',
];

const MARKER_EVENTS = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseout',
  'mouseover',
  'remove',
  'infowindowclose',
  'infowindowopen',
  'dragstart',
  'dragging',
  'dragend',
  'rightclick',
];

const TOGGLE_METHODS = {
  enableMassClear: ['enableMassClear', 'disableMassClear'],
  enableDragging: ['enableDragging', 'disableDragging'],
};

export const MarkerPropsSchema = z.looseObject({
  position: PointLikeSchema.describe('标注位置'),
  type: z.string().optional().describe('标注类型'),
  icon: z.union([z.string(), z.any()]).optional().describe('图标'),
  zIndex: z.number().optional().describe('层级'),
  pane: z.string().optional(),
  offset: z.any().optional().describe('图标偏移'),
  coordType: z.string().optional().describe('坐标类型'),
  isTop: z.boolean().optional(),
  autoViewport: z.boolean().optional(),
  ViewportOptions: z.any().optional(),
  map: z.any().optional(),
  events: z.record(z.string(), z.any()).optional().describe('事件回调'),
});

export type MarkerProps = z.infer<typeof MarkerPropsSchema> & {
  children?: React.ReactNode;
  [key: string]: any;
};

export const Marker: React.FC<MarkerProps> = (props) => {
  const { map, api: B } = useBMap();
  const markerRef = useRef<any>(null);
  const contentDomRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any>(null);

  useEffect(() => {
    if (!map || props.type === 'order_tip') return;

    if (markerRef.current) {
      map.removeOverlay(markerRef.current);
      markerRef.current = null;
    }
    if (contentDomRef.current && rootRef.current) {
      rootRef.current.unmount();
      contentDomRef.current = null;
      rootRef.current = null;
    }

    let icon: any;
    const propsIcon = props.icon;
    const icons = createIcons(B);

    if (propsIcon && propsIcon instanceof B.Icon) {
      icon = propsIcon;
    } else if (propsIcon && icons[propsIcon]) {
      icon = icons[propsIcon];
    } else {
      icon = icons.simple_red;
    }

    let position: any;
    if (props.coordType === 'bd09mc') {
      const projection = map.getMapType().getProjection();
      position = projection.pointToLngLat(new B.Pixel(props.position.lng, props.position.lat));
    } else {
      position = new B.Point(props.position.lng, props.position.lat);
    }

    let marker: any;
    if (props.children != null) {
      const contentDom = document.createElement('div');
      contentDomRef.current = contentDom;
      rootRef.current = createRoot(contentDom);
      rootRef.current.render(
        React.createElement('div', null, props.children)
      );
      const CustomOverlay = createCustomOverlay(B);
      marker = new (CustomOverlay as any)(position, contentDom, {
        zIndex: props.zIndex,
        pane: props.pane,
        offset: props.offset,
      });
      map.addOverlay(marker);
    } else {
      const options = getOptions(props, MARKER_OPTIONS) as any;
      options.icon = icon;
      marker = new B.Marker(position, options);
      if (props.isTop) {
        marker.setTop?.(true);
      }
      if (props.events) {
        MARKER_EVENTS.forEach((evt) => {
          const handler = props.events![evt];
          if (handler) {
            marker.addEventListener(evt, handler);
          }
        });
      }
      Object.entries(TOGGLE_METHODS).forEach(([key, [enable, disable]]) => {
        if (props[key] !== undefined) {
          marker[props[key] ? enable : disable]?.();
        }
      });
      map.addOverlay(marker);
    }
    markerRef.current = marker;

    if (props.autoViewport) {
      map.setViewport?.([position], props.ViewportOptions);
    }

    return () => {
      if (markerRef.current) {
        map.removeOverlay(markerRef.current);
        markerRef.current = null;
      }
      if (contentDomRef.current && rootRef.current) {
        rootRef.current.unmount();
        contentDomRef.current = null;
        rootRef.current = null;
      }
    };
  }, [
    map,
    props.position?.lng,
    props.position?.lat,
    props.type,
    props.icon,
    props.coordType,
    props.children != null,
  ]);

  if (props.type === 'order_tip') {
    return React.createElement(MarkerOrderTip, props);
  }
  return null;
};

export default Marker;
