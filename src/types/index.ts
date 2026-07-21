/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from 'react';
import type { z } from 'zod';
import type { BMapVersion, BMapLoaderGlobalConfig } from '@baidumap/jsapi-loader';
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

export type { BMapVersion, BMapLoaderGlobalConfig };

export interface BMapContextValue {
  map: any;
  api: BMapApi | BMapGLApi;
  apiType: MapApiType;
}

export type BMapLoaderStatus = 'loading' | 'loaded' | 'error';

export interface BMapLoaderContextValue {
  /** 已加载的命名空间（BMap 或 BMapGL） */
  api: BMapApi | BMapGLApi | undefined;
  /** 由 version 推断出的 API 类型 */
  apiType: MapApiType;
  /** 加载器使用的版本 */
  version: BMapVersion;
  /** 加载状态 */
  status: BMapLoaderStatus;
  /** 加载错误 */
  error?: Error;
}

export interface BMapProviderProps {
  /** 开发者密钥。非代理模式必填 */
  ak?: string;
  /** JSAPI 版本，默认 'gl' */
  version?: BMapVersion;
  /** 代理模式服务地址（末尾需带 "/"） */
  serviceHost?: string;
  /** 协议，默认 'https' */
  protocol?: 'https' | 'http';
  /** 加载超时（毫秒），0 表示不超时 */
  timeout?: number;
  /** 创建地图前需全局声明的配置 */
  globalConfig?: BMapLoaderGlobalConfig;
  /** 加载中展示内容 */
  fallback?: React.ReactNode;
  /** 加载失败展示内容 */
  errorFallback?: React.ReactNode;
  children?: React.ReactNode;
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
