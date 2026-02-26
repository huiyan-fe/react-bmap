import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { createRoot } from 'react-dom/client';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';
import { PointLikeSchema } from '../../schemas';

const INFO_OPTIONS = [
  'width',
  'height',
  'maxWidth',
  'offset',
  'title',
  'enableAutoPan',
  'enableCloseOnClick',
  'enableMessage',
  'message',
];

const INFO_EVENTS = ['close', 'open', 'maximize', 'restore', 'clickclose'];

export const InfoWindowPropsSchema = z.looseObject({
  position: PointLikeSchema.describe('信息窗位置'),
  text: z.string().optional().describe('信息窗文本内容'),
  map: z.any().optional(),
  events: z.record(z.string(), z.any()).optional().describe('事件回调'),
  width: z.number().optional(),
  height: z.number().optional(),
  maxWidth: z.number().optional(),
  offset: z.any().optional(),
  title: z.string().optional(),
  enableAutoPan: z.boolean().optional(),
  enableCloseOnClick: z.boolean().optional(),
});

export type InfoWindowProps = z.infer<typeof InfoWindowPropsSchema> & {
  children?: React.ReactNode;
  [key: string]: any;
};

export const InfoWindow: React.FC<InfoWindowProps> = (props) => {
  const { map, api: B } = useBMap();
  const infoWindowRef = useRef<any>(null);
  const rootRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (infoWindowRef.current) {
      map.closeInfoWindow?.();
      infoWindowRef.current = null;
    }
    if (rootRef.current) {
      rootRef.current = null;
    }

    const opts = getOptions(props, INFO_OPTIONS) as any;
    const infoWindow = new B.InfoWindow(props.text || '', opts);
    infoWindowRef.current = infoWindow;

    if (props.events) {
      INFO_EVENTS.forEach((evt) => {
        const handler = props.events![evt];
        if (handler) {
          infoWindow.addEventListener(evt, handler);
        }
      });
    }

    const point = new B.Point(props.position.lng, props.position.lat);
    map.openInfoWindow(infoWindow, point);

    if (props.children != null) {
      const content = document.createElement('div');
      rootRef.current = createRoot(content);
      rootRef.current.render(props.children);
      infoWindow.setContent(content);
    }

    return () => {
      map.closeInfoWindow?.();
      infoWindowRef.current = null;
      rootRef.current?.unmount?.();
      rootRef.current = null;
    };
  }, [
    map,
    props.position?.lng,
    props.position?.lat,
    props.text,
    props.children != null,
  ]);

  return null;
};

export default InfoWindow;
