import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import {
  DataSet,
  utilCityCenter,
  utilCurve,
  baiduMapLayer,
  utilDataRangeIntensity,
} from 'mapv';
import { PointLikeSchema } from '../../schemas';

const ThickRayDataItemSchema = z.object({
  from: z.object({ city: z.string().optional(), name: z.string().optional(), point: PointLikeSchema.optional() }),
  to: z.object({ city: z.string().optional(), name: z.string().optional(), point: PointLikeSchema.optional() }),
  count: z.number().optional(),
  color: z.string().optional(),
});

export const ThickRayPropsSchema = z.object({
  data: z.array(ThickRayDataItemSchema).optional().describe('迁徙射线数据'),
  type: z.enum(['curve', 'line']).optional().describe('线条类型'),
  coordType: z.string().optional(),
  autoViewport: z.boolean().optional(),
  viewportOptions: z.any().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  map: z.any().optional(),
});

export type ThickRayProps = z.infer<typeof ThickRayPropsSchema>;

export const ThickRay: React.FC<ThickRayProps> = (props) => {
  const { map, api: B } = useBMap();
  const lineLayerRef = useRef<any>(null);
  const pointLayerRef = useRef<any>(null);
  const textLayerRef = useRef<any>(null);
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
    }

    const projection = map.getMapType().getProjection();
    const lineData: any[] = [];
    const pointData: any[] = [];
    const points: any[] = [];
    const isCurve = props.type === 'curve';
    const intensity = new (utilDataRangeIntensity as any)({
      maxSize: 10,
      minSize: 1,
      min: props.min ?? 0,
      max: props.max ?? 1000,
    });

    props.data.forEach((item) => {
      const fromCenter =
        item.from.point || (utilCityCenter as any).getCenterByCityName(item.from.city);
      const toCenter =
        item.to.point || (utilCityCenter as any).getCenterByCityName(item.to.city);
      const curve = (utilCurve as any).getPoints([fromCenter, toCenter]);

      if (props.coordType === 'bd09mc') {
        points.push(
          projection.pointToLngLat(new B.Pixel(fromCenter.lng, fromCenter.lat)),
          projection.pointToLngLat(new B.Pixel(toCenter.lng, toCenter.lat))
        );
      } else {
        points.push(fromCenter, toCenter);
      }

      const lineWidth = intensity.getSize?.(item.count ?? 0) ?? 3;

      lineData.push({
        strokeStyle: item.color || '#5E87DB',
        lineWidth,
        geometry: { type: 'LineString', coordinates: isCurve ? curve : [[fromCenter.lng, fromCenter.lat], [toCenter.lng, toCenter.lat]] },
      });

      pointData.push(
        {
          fillStyle: item.color,
          text: item.from.name || item.from.city,
          geometry: { type: 'Point', coordinates: [fromCenter.lng, fromCenter.lat] },
        },
        {
          fillStyle: item.color,
          text: item.to.name || item.to.city,
          geometry: { type: 'Point', coordinates: [toCenter.lng, toCenter.lat] },
        }
      );
    });

    lineDataSetRef.current.set(lineData);
    pointDataSetRef.current.set(pointData);

    if (points.length && props.autoViewport !== false) {
      map.setViewport(points, props.viewportOptions);
    }

    return () => {
      lineLayerRef.current?.destroy?.();
      pointLayerRef.current?.destroy?.();
      textLayerRef.current?.destroy?.();
      createdRef.current = false;
    };
  }, [map, JSON.stringify(props.data)]);

  return null;
};

export default ThickRay;
