import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { PointLikeSchema } from '../../schemas';

export const WalkingRoutePropsSchema = z.object({
  start: PointLikeSchema.describe('起点坐标'),
  end: PointLikeSchema.describe('终点坐标'),
  autoViewport: z.boolean().optional().describe('是否自动调整视野'),
  map: z.any().optional(),
});

export type WalkingRouteProps = z.infer<typeof WalkingRoutePropsSchema>;

export const WalkingRoute: React.FC<WalkingRouteProps> = (props) => {
  const { map, api: B } = useBMap();
  const walkingRef = useRef<any>(null);

  useEffect(() => {
    if (!map || !props.start || !props.end) return;

    if (walkingRef.current) {
      walkingRef.current.clearResults?.();
      walkingRef.current = null;
    }

    const walking = new B.WalkingRoute(map, {
      renderOptions: {
        map,
        autoViewport: props.autoViewport !== undefined ? props.autoViewport : true,
        viewportOptions: { zoomFactor: -1 },
      },
    } as any);

    const start = new B.Point(props.start.lng, props.start.lat);
    const end = new B.Point(props.end.lng, props.end.lat);
    walking.search(start, end);

    walkingRef.current = walking;

    return () => {
      walkingRef.current?.clearResults?.();
      walkingRef.current = null;
    };
  }, [map, props.start?.lng, props.start?.lat, props.end?.lng, props.end?.lat]);

  return null;
};

export default WalkingRoute;
