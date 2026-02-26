import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { DataSet, utilCityCenter, utilCurve, baiduMapLayer, baiduMapAnimationLayer } from 'mapv';
import { PointLikeSchema } from '../../schemas';

const ArcDataItemSchema = z.object({
  from: z.object({ city: z.string().optional(), name: z.string().optional(), point: PointLikeSchema.optional() }),
  to: z.object({ city: z.string().optional(), name: z.string().optional(), point: PointLikeSchema.optional() }),
  color: z.string().optional(),
});

export const ArcPropsSchema = z.object({
  data: z.array(ArcDataItemSchema).optional().describe('迁徙弧线数据'),
  coordType: z.string().optional(),
  autoViewport: z.boolean().optional(),
  viewportOptions: z.any().optional(),
  enableAnimation: z.boolean().optional().describe('是否开启动画'),
  showFromPoint: z.boolean().optional(),
  showToPoint: z.boolean().optional(),
  lineOptions: z.any().optional(),
  pointOptions: z.any().optional(),
  textOptions: z.any().optional(),
  animationOptions: z.any().optional(),
  map: z.any().optional(),
});

export type ArcProps = z.infer<typeof ArcPropsSchema>;

export const Arc: React.FC<ArcProps> = (props) => {
  const { map, api: B } = useBMap();
  const lineLayerRef = useRef<any>(null);
  const pointLayerRef = useRef<any>(null);
  const textLayerRef = useRef<any>(null);
  const animationLayerRef = useRef<any>(null);
  const lineDataSetRef = useRef<any>(null);
  const pointDataSetRef = useRef<any>(null);
  const createdRef = useRef(false);

  useEffect(() => {
    if (!map || !props.data?.length) return;

    if (!createdRef.current) {
      createdRef.current = true;
      lineDataSetRef.current = new DataSet([]);
      pointDataSetRef.current = new DataSet([]);
      lineLayerRef.current = new baiduMapLayer(map, lineDataSetRef.current, {});
      pointLayerRef.current = new baiduMapLayer(map, pointDataSetRef.current, {});
      textLayerRef.current = new baiduMapLayer(map, pointDataSetRef.current, {});
      if (props.enableAnimation) {
        animationLayerRef.current = new baiduMapAnimationLayer(map, lineDataSetRef.current, {});
      }
    }

    const projection = map.getMapType().getProjection();
    const lineData: any[] = [];
    const pointData: any[] = [];
    const points: any[] = [];

    props.data.forEach((item) => {
      const fromCenter = item.from.point || (utilCityCenter as any).getCenterByCityName(item.from.city);
      const toCenter = item.to.point || (utilCityCenter as any).getCenterByCityName(item.to.city);
      const curve = (utilCurve as any).getPoints([fromCenter, toCenter]);

      if (props.coordType === 'bd09mc') {
        points.push(
          projection.pointToLngLat(new B.Pixel(fromCenter.lng, fromCenter.lat)),
          projection.pointToLngLat(new B.Pixel(toCenter.lng, toCenter.lat))
        );
      } else {
        points.push(fromCenter, toCenter);
      }

      lineData.push({
        strokeStyle: item.color || '#5E87DB',
        geometry: { type: 'LineString', coordinates: curve },
      });

      if (props.showToPoint !== false) {
        pointData.push({
          fillStyle: item.color,
          text: item.to.name || item.to.city,
          geometry: { type: 'Point', coordinates: [toCenter.lng, toCenter.lat] },
        });
      }
      if (props.showFromPoint !== false) {
        pointData.push({
          fillStyle: item.color,
          text: item.from.name || item.from.city,
          geometry: { type: 'Point', coordinates: [fromCenter.lng, fromCenter.lat] },
        });
      }
    });

    lineDataSetRef.current.set(lineData);
    lineLayerRef.current?.update?.({
      options: props.lineOptions || { draw: 'simple', strokeStyle: '#5E87DB', lineWidth: 3 },
    });
    pointDataSetRef.current.set(pointData);
    pointLayerRef.current?.update?.({
      options: props.pointOptions || {
        coordType: props.coordType,
        draw: 'simple',
        fillStyle: '#5E87DB',
        size: 5,
      },
    });
    textLayerRef.current?.update?.({
      options: props.textOptions || {
        coordType: props.coordType,
        draw: 'text',
        font: '18px Arial',
        offset: { x: 0, y: 12 },
        fillStyle: '#333',
        size: 12,
      },
    });

    if (props.enableAnimation) {
      animationLayerRef.current?.update?.({
        options: props.animationOptions || {
          coordType: props.coordType,
          fillStyle: 'rgba(255, 250, 250, 0.9)',
          lineWidth: 0,
          size: 4,
          animateTime: 50,
          draw: 'simple',
        },
      });
    }

    if (points.length && props.autoViewport !== false) {
      map.setViewport(points, props.viewportOptions);
    }

    return () => {
      lineLayerRef.current?.destroy?.();
      pointLayerRef.current?.destroy?.();
      textLayerRef.current?.destroy?.();
      animationLayerRef.current?.destroy?.();
      lineLayerRef.current = null;
      pointLayerRef.current = null;
      textLayerRef.current = null;
      animationLayerRef.current = null;
      createdRef.current = false;
    };
  }, [map, JSON.stringify(props.data)]);

  return null;
};

export default Arc;
