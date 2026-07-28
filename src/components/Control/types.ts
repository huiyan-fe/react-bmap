import type { Size, ControlAnchor } from '../../types-skd';

// 字段按 bmap-jsapi-dts src/control/NavigationControlOptions.d.ts
export interface NavigationControlOptions {
  anchor?: ControlAnchor;
  offset?: Size;
  type?: number;
  showZoomInfo?: boolean;
  enableGeolocation?: boolean;
}
