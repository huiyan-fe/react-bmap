import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';
import { createPoint } from '../../utils/createPoint';
import { PointLikeSchema } from '../../schemas';

const POLYGON_OPTIONS = [
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

const POLYGON_EVENTS = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseout',
  'mouseover',
  'remove',
  'lineupdate',
];

export const PolygonPropsSchema = z.looseObject({
  path: z.array(PointLikeSchema).describe('多边形顶点数组'),
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

export type PolygonProps = z.infer<typeof PolygonPropsSchema> & { [key: string]: any };

export const Polygon: React.FC<PolygonProps> = (props) => {
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
    const options = getOptions(props, POLYGON_OPTIONS) as any;
    const polygon = new B.Polygon(path, options);
    overlayRef.current = polygon;

    if (props.events) {
      POLYGON_EVENTS.forEach((evt) => {
        const handler = props.events![evt];
        if (handler) {
          polygon.addEventListener(evt, handler);
        }
      });
    }

    map.addOverlay(polygon);

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

export default Polygon;
