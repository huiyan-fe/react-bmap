import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';
import { createPoint } from '../../utils/createPoint';
import { PointLikeSchema } from '../../schemas';

const POLYLINE_OPTIONS = [
  'strokeColor',
  'fillColor',
  'strokeWeight',
  'strokeOpacity',
  'fillOpacity',
  'strokeStyle',
  'enableMassClear',
  'enableEditing',
  'enableClicking',
];

const POLYLINE_EVENTS = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseout',
  'mouseover',
  'remove',
  'lineupdate',
];

export const PolylinePropsSchema = z.looseObject({
  path: z.array(PointLikeSchema).describe('折线顶点数组'),
  autoViewport: z.boolean().optional(),
  viewportOptions: z.any().optional(),
  map: z.any().optional(),
  events: z.record(z.string(), z.any()).optional().describe('事件回调'),
  strokeColor: z.string().optional(),
  fillColor: z.string().optional(),
  strokeWeight: z.number().optional(),
  strokeOpacity: z.number().optional(),
  fillOpacity: z.number().optional(),
  strokeStyle: z.string().optional(),
});

export type PolylineProps = z.infer<typeof PolylinePropsSchema> & { [key: string]: any };

export const Polyline: React.FC<PolylineProps> = (props) => {
  const { map, api: B } = useBMap();
  const overlayRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (overlayRef.current) {
      map.removeOverlay(overlayRef.current);
      overlayRef.current = null;
    }

    const path = (props.path || []).map((item) =>
      createPoint(item, B.Point)
    );
    const options = getOptions(props, POLYLINE_OPTIONS) as any;
    const polyline = new B.Polyline(path, options);
    overlayRef.current = polyline;

    if (props.events) {
      POLYLINE_EVENTS.forEach((evt) => {
        const handler = props.events![evt];
        if (handler) {
          polyline.addEventListener(evt, handler);
        }
      });
    }

    map.addOverlay(polyline);

    if (props.autoViewport && path.length > 0) {
      map.setViewport?.(path, props.viewportOptions);
    }

    return () => {
      map.removeOverlay(overlayRef.current);
      overlayRef.current = null;
    };
  }, [map, JSON.stringify(props.path), props.autoViewport]);

  return null;
};

export default Polyline;
