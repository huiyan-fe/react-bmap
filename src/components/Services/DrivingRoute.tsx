import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { PointLikeSchema } from '../../schemas';

declare const BMAP_DRIVING_POLICY_LEAST_TIME: number;
declare const BMAP_DRIVING_POLICY_LEAST_DISTANCE: number;

export const DrivingRoutePropsSchema = z.object({
  start: PointLikeSchema.describe('起点坐标'),
  end: PointLikeSchema.describe('终点坐标'),
  policy: z.number().optional().describe('驾车策略'),
  autoViewport: z.boolean().optional().describe('是否自动调整视野'),
  map: z.any().optional(),
});

export type DrivingRouteProps = z.infer<typeof DrivingRoutePropsSchema>;

export const DrivingRoute: React.FC<DrivingRouteProps> = (props) => {
  const { map, api: B } = useBMap();
  const drivingRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !props.start || !props.end) return;

    if (drivingRef.current) {
      drivingRef.current.clearResults?.();
      drivingRef.current = null;
    }

    const driving = new B.DrivingRoute(map, {
      renderOptions: {
        map,
        policy: props.policy ?? (typeof BMAP_DRIVING_POLICY_LEAST_TIME !== 'undefined' ? BMAP_DRIVING_POLICY_LEAST_TIME : 0),
        autoViewport: props.autoViewport !== undefined ? props.autoViewport : true,
        viewportOptions: { zoomFactor: -1 },
      },
    } as any);

    const start = new B.Point(props.start.lng, props.start.lat);
    const end = new B.Point(props.end.lng, props.end.lat);
    driving.search(start, end);

    drivingRef.current = driving;

    return () => {
      drivingRef.current?.clearResults?.();
      drivingRef.current = null;
    };
  }, [map, props.start?.lng, props.start?.lat, props.end?.lng, props.end?.lat]);

  return null;
};

export default DrivingRoute;
