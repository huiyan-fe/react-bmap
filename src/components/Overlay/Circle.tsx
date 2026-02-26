import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { getOptions } from '../../hooks/useGetOptions';
import { createPoint } from '../../utils/createPoint';
import { PointLikeSchema } from '../../schemas';

const CIRCLE_OPTIONS = [
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

const CIRCLE_EVENTS = [
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseout',
  'mouseover',
  'remove',
  'lineupdate',
];

export const CirclePropsSchema = z.looseObject({
  center: PointLikeSchema.describe('圆心坐标'),
  radius: z.number().describe('半径（米）'),
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

export type CircleProps = z.infer<typeof CirclePropsSchema> & { [key: string]: any };

export const Circle: React.FC<CircleProps> = (props) => {
  const { map, api: B } = useBMap();
  const overlayRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (overlayRef.current) {
      map.removeOverlay(overlayRef.current);
      overlayRef.current = null;
    }

    const center = createPoint(props.center, B.Point);
    const options = getOptions(props, CIRCLE_OPTIONS) as any;
    const circle = new B.Circle(center, props.radius, options);
    overlayRef.current = circle;

    if (props.events) {
      CIRCLE_EVENTS.forEach((evt) => {
        const handler = props.events![evt];
        if (handler) {
          circle.addEventListener(evt, handler);
        }
      });
    }

    map.addOverlay(circle);

    if (props.autoViewport) {
      const path = circle.getBounds?.()
        ? [circle.getBounds().getCenter(), circle.getBounds().getNorthEast()]
        : [center];
      map.setViewport?.(path, props.viewportOptions);
    }

    return () => {
      map.removeOverlay(overlayRef.current);
      overlayRef.current = null;
    };
  }, [
    map,
    props.center?.lng,
    props.center?.lat,
    props.radius,
    props.autoViewport,
  ]);

  return null;
};

export default Circle;
