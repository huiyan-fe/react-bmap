/**
 * Marker3D — 3D 标注组件（v4+ WebGL only）。
 * 使用 createOverlayComponent 标准 factory 模式。
 * SDK: constructor(point, height, { shape, size, fillColor, fillOpacity, enableMassClear })
 * setter: setPosition/setHeight/setFillColor/setFillOpacity（shape/size 无 setter，走 ctorOnlyProps 重建）
 */
export { Marker3D } from '.';
export type { Marker3DProps, Marker3DOptions } from './types';
