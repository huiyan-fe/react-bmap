/**
 * 核心类型定义。
 *
 * 类型来源：bmap-jsapi-dts（src 目录下的 .d.ts 文件）。
 * 本文件只重新组织「库内部需要」的类型形态，不重复 dts 的完整 API 描述。
 * 具体 SDK 类（Map/Marker/...）的成员在 dts 中查阅，库内部用 brand handle 包装。
 */

// ─────────────── 基础几何类型（不可变 plain object 形态） ───────────────

export interface Point {
  lng: number;
  lat: number;
}

export interface Pixel {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  sw: Point;
  ne: Point;
}

// ─────────────── Brand Handle（避免裸用 SDK 实例） ───────────────

export interface MapHandle {
  readonly __brand: 'MapHandle';
  readonly raw: unknown;
}

export interface OverlayHandle {
  readonly __brand: 'OverlayHandle';
  readonly raw: unknown;
  readonly type: string;
}

export interface ControlHandle {
  readonly __brand: 'ControlHandle';
  readonly raw: unknown;
  readonly type: string;
}

export interface LayerHandle {
  readonly __brand: 'LayerHandle';
  readonly raw: unknown;
  readonly kind: LayerKind;
}

export interface ServiceHandle {
  readonly __brand: 'ServiceHandle';
  readonly raw: unknown;
  readonly isNull: boolean;
}

export type LayerKind = 'tile' | 'normal' | 'geojson' | 'district' | 'traffic' | 'custom' | 'canvas';

// ─────────────── 版本与能力 ───────────────

/**
 * JSAPI 版本。
 *
 * 框架显式支持 '3.0' 与 '4.0'，但允许传入任意字符串（如未来的 '4.1'、'5.0'）。
 * - '3.0'：使用 v3Driver
 * - 其它任何值（'4.0' / '4.1' / '5.0' / ...）：使用 v4Driver，按 4.0 baseline 处理
 * - jsapi-loader 始终按用户传入的 version 加载
 *
 * `(string & {})` 是 TS 的常见技巧：既允许任意字符串，又能在 IDE 里给出 '3.0' / '4.0' 的补全提示。
 */
export type BMapVersion = '3.0' | '4.0' | (string & {});

export type UnsupportedBehavior = 'throw' | 'warn' | 'ignore';

/**
 * 能力标识。
 *
 * 完整清单由 scripts/gen-capability-matrix.ts 从 bmap-jsapi-dts 的
 * @since / @removed 自动生成。此处仅手写常见项作为种子。
 * 真正的能力矩阵见 src/drivers/capabilityMatrix.ts。
 */
export type Capability = string;

// ─────────────── 事件 ───────────────

export interface BMapEvent<T = unknown> {
  type: string;
  target: MapHandle | OverlayHandle | ControlHandle | null;
  point?: Point;
  pixel?: Pixel;
  overlay?: OverlayHandle;
  raw: T;
}

// ─────────────── 加载状态 ───────────────

export type LoaderStatus = 'loading' | 'ready' | 'error';

export interface LoadKeyComponents {
  version: BMapVersion;
  ak: string;
  serviceHost?: string;
  language?: string;
  plugins?: string[];
}
