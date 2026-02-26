import React, { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useBMap } from '../../context/BMapContext';
import { baiduMapCanvasLayer } from 'mapv';
import { drawRoads } from '../../utils/map-line';
import { mergeRoadPath } from '../../utils/merge';

export const RoadPropsSchema = z.object({
  roadPath: z.array(z.string()).optional().describe('道路路径'),
  roadPaths: z.array(z.array(z.string())).optional().describe('多组道路路径'),
  category: z.array(z.any()).optional(),
  splitList: z.record(z.string(), z.string()).optional(),
  color: z.string().optional().describe('线条颜色'),
  lineWidth: z.number().optional().describe('线宽'),
  lineWidths: z.array(z.number()).optional(),
  coordType: z.string().optional(),
  autoViewport: z.boolean().optional(),
  viewportOptions: z.any().optional(),
  isShowArrow: z.boolean().optional(),
  arrowColor: z.string().optional(),
  bgColor: z.string().optional(),
  zIndex: z.number().optional(),
  onClick: z.any().optional().describe('点击回调'),
  map: z.any().optional(),
});

export type RoadProps = z.infer<typeof RoadPropsSchema>;

export const Road: React.FC<RoadProps> = (props) => {
  const { map, api: B } = useBMap();
  const canvasLayerRef = useRef<any>(null);

  const getRoadPoints = (roadPath: string[]) => {
    const projection = map.getMapType().getProjection();
    const points: any[] = [];
    roadPath.forEach((item) => {
      const tmp = item.split(',');
      for (let j = 0; j < tmp.length; j += 2) {
        if (props.coordType === 'bd09mc') {
          points.push(
            projection.pointToLngLat(new B.Pixel(parseFloat(tmp[j]), parseFloat(tmp[j + 1])))
          );
        } else {
          points.push(new B.Point(parseFloat(tmp[j]), parseFloat(tmp[j + 1])));
        }
      }
    });
    return points;
  };

  useEffect(() => {
    if (!map) return;

    const updateViewport = () => {
      const points: any[] = [];
      if (props.roadPaths) {
        props.roadPaths.forEach((rp) => points.push(...getRoadPoints(rp)));
      } else if (props.roadPath) {
        points.push(...getRoadPoints(props.roadPath));
      }
      if (points.length && props.autoViewport !== false) {
        map.setViewport(points, props.viewportOptions);
      }
    };

    const getRoadGroup = (roadPath: string[], category?: any[], splitList?: any) => {
      const data: Record<string, any> = {};
      const allPath: string[] = [];
      if (category) {
        category.forEach((cat, i) => {
          if (!data[cat]) data[cat] = { roadPath: [], color: splitList?.[cat] };
          allPath.push(roadPath[i]);
          data[cat].roadPath.push(roadPath[i]);
        });
      } else {
        data[0] = { roadPath, color: props.color || '#1495ff' };
      }
      return { group: data, allPath: mergeRoadPath(category ? allPath : roadPath) };
    };

    const canvasLayerUpdate = (canvasLayer: any) => {
      const ctx = canvasLayer.canvas?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasLayer.canvas.width, canvasLayer.canvas.height);

      const drawRoad = (roadPath: string[], category?: any[], splitList?: any) => {
        const roadGroup = getRoadGroup(roadPath, category, splitList);
        const data = roadGroup.group;
        const lw = props.lineWidth || 10;

        drawRoads(map, ctx, roadGroup.allPath, {
          color: props.bgColor || '#fff',
          coordType: props.coordType,
          lineWidth: lw + 4,
          lineCap: 'butt',
          arrow: false,
          line: true,
        });

        Object.keys(data).forEach((key) => {
          const item = data[key];
          const rp = mergeRoadPath(item.roadPath);
          drawRoads(map, ctx, rp, {
            color: item.color,
            coordType: props.coordType,
            line: true,
            lineWidth: lw,
            lineCap: 'butt',
            arrow: false,
          });
        });

        drawRoads(map, ctx, roadGroup.allPath, {
          color: props.color || '#1495ff',
          coordType: props.coordType,
          lineWidth: lw,
          border: {},
          lineCap: 'butt',
          arrow: props.isShowArrow !== false
            ? { width: 5, height: 3, color: props.arrowColor }
            : false,
        });
      };

      if (props.roadPaths) {
        props.roadPaths.forEach((rp, i) => {
          drawRoad(rp, props.category, props.splitList);
        });
      } else if (props.roadPath) {
        drawRoad(props.roadPath, props.category, props.splitList);
      }
    };

    if (!canvasLayerRef.current) {
      canvasLayerRef.current = new baiduMapCanvasLayer({
        zIndex: props.zIndex,
        map,
        update: function (this: any) {
          canvasLayerUpdate(this);
        },
      });
      if (props.onClick) {
        map.addEventListener('click', (e: any) => {
          const isClick = (rp: string[]) => {
            const roadGroup = getRoadGroup(rp, props.category, props.splitList);
            const ctx = (canvasLayerRef.current as any)?.canvas?.getContext('2d');
            if (!ctx) return false;
            ctx.beginPath();
            drawRoads(map, ctx, roadGroup.allPath, {
              color: props.bgColor || '#fff',
              lineWidth: (props.lineWidth || 10) + 4,
              lineCap: 'butt',
              arrow: false,
              line: false,
            });
            return ctx.isPointInStroke(
              e.pixel.x * (typeof window !== 'undefined' ? window.devicePixelRatio : 1),
              e.pixel.y * (typeof window !== 'undefined' ? window.devicePixelRatio : 1)
            );
          };
          if (props.roadPaths) {
            props.roadPaths.forEach((rp, i) => {
              if (isClick(rp)) props.onClick?.(i);
            });
          } else if (props.roadPath && isClick(props.roadPath)) {
            props.onClick?.();
          }
        });
      }
    }

    (canvasLayerRef.current as any)?.draw?.();
    updateViewport();

    return () => {
      (canvasLayerRef.current as any)?.hide?.();
      canvasLayerRef.current = null;
    };
  }, [map, JSON.stringify(props.roadPath), JSON.stringify(props.roadPaths)]);

  return null;
};

export default Road;
