/* eslint-disable @typescript-eslint/no-explicit-any */

import type { z } from 'zod';
import {
  PointLikeSchema,
  SizeLikeSchema,
  MapApiTypeSchema,
} from '../schemas';

export type BMapApi = typeof BMap;
export type BMapGLApi = typeof BMapGL;

export type MapApiType = z.infer<typeof MapApiTypeSchema>;
export type PointLike = z.infer<typeof PointLikeSchema>;
export type SizeLike = z.infer<typeof SizeLikeSchema>;

export { PointLikeSchema, SizeLikeSchema, MapApiTypeSchema };

export interface BMapContextValue {
  map: any;
  api: BMapApi | BMapGLApi;
  apiType: MapApiType;
}

export interface MapEvents {
  click?: (e: any) => void;
  dblclick?: (e: any) => void;
  rightclick?: (e: any) => void;
  rightdblclick?: (e: any) => void;
  maptypechange?: (e: any) => void;
  mousemove?: (e: any) => void;
  mouseover?: (e: any) => void;
  mouseout?: (e: any) => void;
  movestart?: (e: any) => void;
  moving?: (e: any) => void;
  moveend?: (e: any) => void;
  zoomstart?: (e: any) => void;
  zoomend?: (e: any) => void;
  addoverlay?: (e: any) => void;
  addcontrol?: (e: any) => void;
  removecontrol?: (e: any) => void;
  removeoverlay?: (e: any) => void;
  clearoverlays?: (e: any) => void;
  dragstart?: (e: any) => void;
  dragging?: (e: any) => void;
  dragend?: (e: any) => void;
  addtilelayer?: (e: any) => void;
  removetilelayer?: (e: any) => void;
  load?: (e: any) => void;
  resize?: (e: any) => void;
  hotspotclick?: (e: any) => void;
  hotspotover?: (e: any) => void;
  hotspotout?: (e: any) => void;
  tilesloaded?: (e: any) => void;
  touchstart?: (e: any) => void;
  touchmove?: (e: any) => void;
  touchend?: (e: any) => void;
  longpress?: (e: any) => void;
}
