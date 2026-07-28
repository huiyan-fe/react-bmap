/**
 * SDK 类型的占位（开发时按 bmap-jsapi-dts 全量替换）。
 *
 * 当前为框架占位类型，避免组件实现阻塞。
 */

export interface Icon {
  __iconBrand?: 'BMap.Icon';
  url?: string;
  size?: import('.').Size;
  [k: string]: unknown;
}

export type Size = { width: number; height: number };

export type ControlAnchor = number;

export interface Label {
  __labelBrand?: 'BMap.Label';
  content?: string;
  [k: string]: unknown;
}
