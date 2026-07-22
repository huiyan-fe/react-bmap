import { z } from 'zod';

/** 坐标点 { lng, lat } */
export const PointLikeSchema = z.object({
  lng: z.number(),
  lat: z.number(),
});

/** 尺寸 { width, height } */
export const SizeLikeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

/** 地图 API 类型：default 或 gl */
export const MapApiTypeSchema = z.enum(['default', 'gl']);
