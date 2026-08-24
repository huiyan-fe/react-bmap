/**
 * ThreeLayer — three.js 图层（手写组件，继承 NormalLayer）。
 * @since 4.0
 *
 * 组件方式：
 * ```tsx
 * const layerRef = useRef<ThreeLayerRef>(null);
 * <ThreeLayer
 *   ref={layerRef}
 *   antialias
 *   zIndex={5}
 *   onInit={(renderer, scene, camera, layer) => {
 *     const mesh = new THREE.Mesh(
 *       new THREE.BoxGeometry(500, 500, 500),
 *       new THREE.MeshBasicMaterial({ color: 0x1890ff }),
 *     );
 *     const [x, y] = layer.toWorld(center)!;
 *     mesh.position.set(x, y, 250);
 *     layer.add(mesh);
 *     layer.triggerRepaint();  // 不调这一下 animate() 直接 return，画面不会更新
 *   }}
 * />
 * ```
 *
 * 实现要点：
 * - three.js 由宿主工程自己引入，且必须挂在 window.THREE 上：SDK 构造函数第一行就
 *   `if (!window.THREE) throw`，异常被 createLayerFactory 吞掉后图层静默变成 null。
 *   这里缺失时打一次警告，避免「什么都没发生」。
 * - ctorKey 只含 alpha / antialias / 是否接了 onRender：前两个在 onAdd 时被烧进
 *   WebGLRenderer，后者决定 SDK 走不走默认渲染，三者只能重建；其余参数都走
 *   NormalLayer 的 setter，改一个 zIndex 不会把用户的 three.js 场景销毁重建。
 * - 生命周期回调传固定 wrapper（普通函数，SDK 用 hook.bind(this) 调用），内部读 ref
 *   取最新回调；同时把图层实例作为第 4 个参数传出去，箭头函数也能拿到。
 * - opacity 对本图层无效，见 ThreeLayerOptions.opacity 的说明。
 */
import { forwardRef, memo, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';
import { debugWarn, devWarn } from '../../utils/debugWarn';
import { useLatest } from '../../utils/useLatest';
import { tryGetSDK } from '../../utils/sdk';
import type { Point } from '../../types';

/**
 * three.js 的对象（Scene / Camera / WebGLRenderer / Object3D 等）。
 * 本库不依赖 three，也不想把 three 的类型塞进公共 API，交由宿主自行断言。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ThreeObject = any;

/** SDK ThreeLayer 实例上实际存在的成员（取自 v4 bundle） */
export interface ThreeLayerInstance {
  scene?: ThreeObject;
  camera?: ThreeObject;
  renderer?: ThreeObject;
  map?: ThreeObject;
  add(object: ThreeObject): void;
  remove(object: ThreeObject): void;
  getScene(): ThreeObject;
  getCamera(): ThreeObject;
  getRender(): ThreeObject;
  getMap(): ThreeObject | null;
  triggerRepaint(): void;
  triggerStop(): void;
  refreshMap(): void;
  pick(x: number, y: number): ThreeObject[] | null;
}

/**
 * 生命周期回调。
 *
 * SDK 用 `hook.bind(this)(renderer, scene, camera)` 调用，所以普通函数里的 `this` 是 SDK 图层实例；
 * 第 4 个参数 `layer` 是组件对外的命令式句柄（与 ref 拿到的是同一个对象），箭头函数用它。
 */
export type ThreeLayerHook = (
  this: ThreeLayerInstance,
  renderer: ThreeObject,
  scene: ThreeObject,
  camera: ThreeObject,
  layer: ThreeLayerRef,
) => void;

/** 命令式句柄。图层实例要等 GL 就绪才有，所以句柄本身始终存在，成员在就绪前为 null / no-op。 */
export interface ThreeLayerRef {
  /** SDK 图层实例；GL 就绪（onInit 触发）前为 null */
  readonly raw: ThreeLayerInstance | null;
  readonly scene: ThreeObject | null;
  readonly camera: ThreeObject | null;
  readonly renderer: ThreeObject | null;
  add(object: ThreeObject): void;
  remove(object: ThreeObject): void;
  triggerRepaint(): void;
  triggerStop(): void;
  refreshMap(): void;
  pick(x: number, y: number): ThreeObject[] | null;
  /**
   * 经纬度 → three.js 世界坐标（相对固定墨卡托基准点的偏移，单位约等于米）。
   *
   * 走 map.toFormatCoords，而不是实例上的 convertLngLat —— 后者在 v4 里是坏的：
   * 它把 `map.toFormatCoords`（一个函数）当成带 setCenter 的对象用，一调就 TypeError。
   */
  toWorld(point: Point): [number, number] | null;
}

export interface ThreeLayerOptions {
  /** 传给 THREE.WebGLRenderer 的 alpha，默认 false。变化会重建图层。 */
  alpha?: boolean;
  /** 传给 THREE.WebGLRenderer 的 antialias，默认 false。变化会重建图层。 */
  antialias?: boolean;
  /** 是否显示，默认 true */
  visible?: boolean;
  /** 最小显示级别，默认 3 */
  minZoom?: number;
  /** 最大显示级别，默认 21 */
  maxZoom?: number;
  /** 层级，默认 1 */
  zIndex?: number;
  /**
   * 参考中心点。只会写到实例的 this.center，而 v4 的 ThreeLayer.render 取的矩阵
   * （_updatePolyLayerMatrix）并不带它 —— 世界坐标只能相对默认墨卡托基准点，
   * 传了反而对不上，一般不用给。
   */
  referCenter?: Point;
  /**
   * @deprecated 对 ThreeLayer 无效。NormalLayer 构造函数会存 this.opacity、也提供
   * setOpacity/getOpacity，但 ThreeLayer.render 只做 renderer.render(scene, camera)，
   * 整块原型里从不读它（真正消费它的是 LineLayer / FillLayer 这类自己写 shader、
   * 把它当 u_opacity uniform 的图层）。three.js 的透明度请设在材质上
   * （material.transparent = true 且 material.opacity = x）。
   */
  opacity?: number;
}

export interface ThreeLayerProps extends ThreeLayerOptions {
  /** GL 就绪、场景/相机/渲染器创建完成后调用，在这里往场景里加物体 */
  onInit?: ThreeLayerHook;
  /**
   * 接管渲染。SDK 里这是 if/else：接了它就**不再**调用默认的
   * renderer.render(scene, camera)，必须自己渲染。变化会重建图层。
   */
  onRender?: ThreeLayerHook;
  /** 每帧渲染前 */
  preRender?: ThreeLayerHook;
  /** 每帧渲染后 */
  afterRender?: ThreeLayerHook;
  /** 图层销毁前。SDK 随后会 dispose 场景与渲染器，场景里的物体不需要自己清 */
  onDestroy?: ThreeLayerHook;
  /** 因 visible / 缩放级别超出 [minZoom, maxZoom] 而隐藏时 */
  onHide?: ThreeLayerHook;
  /** 从隐藏恢复显示时 */
  onShow?: ThreeLayerHook;
}

/** window.THREE 缺失只提醒一次，避免每次重渲染都刷屏 */
let warnedMissingThree = false;

function warnMissingThree(): void {
  if (warnedMissingThree) return;
  warnedMissingThree = true;
  try {
    if (typeof console === 'undefined') return;
    // 这条不走 devWarn：生产环境同样是「图层静默消失」，必须能看见
    console.warn(
      '[react-bmap] <ThreeLayer> 需要宿主工程自行引入 three.js 并挂到 window.THREE 上，' +
        '当前未检测到，图层已跳过创建。异步加载 three.js 时，请等就绪后再渲染 <ThreeLayer>。',
    );
  } catch {
    // 日志不能反过来把调用方搞崩
  }
}

/** referCenter：SDK 的 setRefCenter 要求 instanceof Point，普通对象会被静默忽略 */
function toSDKPoint(point: Point): unknown {
  const SDK = tryGetSDK();
  return SDK ? new SDK.Point(point.lng, point.lat) : undefined;
}

const ThreeLayerInner = forwardRef<ThreeLayerRef, ThreeLayerProps>(function ThreeLayer(props, ref) {
  const { alpha, antialias, visible, opacity, minZoom, maxZoom, zIndex, referCenter } = props;
  const { map, driver } = useMapContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawRef = useRef<any>(null);
  const mapRef = useLatest(map);
  const warnedOpacityRef = useRef(false);

  const onInitRef = useLatest(props.onInit);
  const onRenderRef = useLatest(props.onRender);
  const preRenderRef = useLatest(props.preRender);
  const afterRenderRef = useLatest(props.afterRender);
  const onDestroyRef = useLatest(props.onDestroy);
  const onHideRef = useLatest(props.onHide);
  const onShowRef = useLatest(props.onShow);

  // 命令式句柄：实例要等 onAdd 才有，所以句柄是稳定对象，方法体内现读 rawRef
  const handle = useMemo<ThreeLayerRef>(() => ({
    get raw() { return rawRef.current ?? null; },
    get scene() { return rawRef.current?.scene ?? null; },
    get camera() { return rawRef.current?.camera ?? null; },
    get renderer() { return rawRef.current?.renderer ?? null; },
    add(object) { rawRef.current?.add(object); },
    remove(object) { rawRef.current?.remove(object); },
    triggerRepaint() { rawRef.current?.triggerRepaint(); },
    triggerStop() { rawRef.current?.triggerStop(); },
    refreshMap() { rawRef.current?.refreshMap(); },
    pick(x, y) { return rawRef.current?.pick(x, y) ?? null; },
    toWorld(point) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawMap = rawRef.current?.map ?? (mapRef.current as any)?.raw;
      if (!rawMap?.toFormatCoords) return null;
      try {
        const [pair] = rawMap.toFormatCoords([[point.lng, point.lat]]);
        return [pair[0], pair[1]];
      } catch (e) {
        debugWarn('ThreeLayer.toWorld', e);
        return null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  useImperativeHandle(ref, () => handle, [handle]);

  // 只有真的传了 onRender 才把它挂进 options：SDK 是
  // `this.options.onRender ? 自定义 : renderer.render(scene, camera)`，
  // 无条件挂一个 wrapper 会把默认渲染整个关掉 → 画面全空。
  const hasOnRender = !!props.onRender;

  // create + add（只有构造期才生效的参数变化时重建）
  const ctorKey = `${alpha ?? ''}|${antialias ?? ''}|${hasOnRender}`;
  useLayoutEffect(() => {
    if (!map || !driver) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(globalThis as any).THREE) {
      warnMissingThree();
      return;
    }

    const opts: Record<string, unknown> = {};
    if (alpha !== undefined) opts.alpha = alpha;
    if (antialias !== undefined) opts.antialias = antialias;
    // 公共参数也在构造时带上，省掉「先建好再 setXxx」的一帧抖动
    if (visible !== undefined) opts.visible = visible;
    if (minZoom !== undefined) opts.minZoom = minZoom;
    if (maxZoom !== undefined) opts.maxZoom = maxZoom;
    if (zIndex !== undefined) opts.zIndex = zIndex;
    if (opacity !== undefined) opts.opacity = opacity;
    if (referCenter !== undefined) opts.referCenter = toSDKPoint(referCenter);

    // 固定 wrapper + ref 取最新回调：options 在构造时定型，回调换了不该重建图层
    const hook = (get: () => ThreeLayerHook | undefined) =>
      function (this: ThreeLayerInstance, renderer: ThreeObject, scene: ThreeObject, camera: ThreeObject) {
        get()?.call(this, renderer, scene, camera, handle);
      };
    opts.onInit = hook(() => onInitRef.current);
    opts.preRender = hook(() => preRenderRef.current);
    opts.afterRender = hook(() => afterRenderRef.current);
    opts.onDestroy = hook(() => onDestroyRef.current);
    opts.onHide = hook(() => onHideRef.current);
    opts.onShow = hook(() => onShowRef.current);
    if (hasOnRender) {
      opts.onRender = function (this: ThreeLayerInstance, renderer: ThreeObject, scene: ThreeObject, camera: ThreeObject) {
        const fn = onRenderRef.current;
        // 运行期把 onRender 撤成 undefined 时兜底走默认渲染，否则画面会停住
        if (fn) fn.call(this, renderer, scene, camera, handle);
        else renderer.render(scene, camera);
      };
    }

    const layerHandle = driver.createThreeLayer(opts);
    if (!layerHandle) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rawRef.current = (layerHandle as any).raw;
    driver.addLayer(map, layerHandle);

    return () => {
      driver.removeLayer(map, layerHandle);
      rawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, ctorKey]);

  // setVisible
  useEffect(() => {
    if (!rawRef.current || visible === undefined) return;
    try { rawRef.current.setVisible?.(visible); } catch (e) { debugWarn('ThreeLayer.setVisible', e); }
  }, [visible]);

  // setMinZoom / setMaxZoom（SDK 会拒绝越界值：minZoom > maxZoom 时静默不改）
  useEffect(() => {
    if (!rawRef.current || minZoom === undefined) return;
    try { rawRef.current.setMinZoom?.(minZoom); } catch (e) { debugWarn('ThreeLayer.setMinZoom', e); }
  }, [minZoom]);

  useEffect(() => {
    if (!rawRef.current || maxZoom === undefined) return;
    try { rawRef.current.setMaxZoom?.(maxZoom); } catch (e) { debugWarn('ThreeLayer.setMaxZoom', e); }
  }, [maxZoom]);

  // setZIndex
  useEffect(() => {
    if (!rawRef.current || zIndex === undefined) return;
    try { rawRef.current.setZIndex?.(zIndex); } catch (e) { debugWarn('ThreeLayer.setZIndex', e); }
  }, [zIndex]);

  // setRefCenter（SDK 要求 instanceof Point）
  useEffect(() => {
    if (!rawRef.current || referCenter === undefined) return;
    const pt = toSDKPoint(referCenter);
    if (!pt) return;
    try { rawRef.current.setRefCenter?.(pt); } catch (e) { debugWarn('ThreeLayer.setRefCenter', e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referCenter?.lng, referCenter?.lat]);

  // opacity：照样喂给 SDK（getOpacity 能读回一致的值），但 ThreeLayer 的 render 不读它
  useEffect(() => {
    if (opacity === undefined) return;
    // 只提醒一次：这个值常常挂在滑块上，每次变化都打就成了刷屏
    if (!warnedOpacityRef.current) {
      warnedOpacityRef.current = true;
      devWarn('<ThreeLayer> 的 opacity 对本图层无效：ThreeLayer.render 从不读 this.opacity，透明度请设在 three.js 材质上（material.transparent + material.opacity）。');
    }
    if (!rawRef.current) return;
    try { rawRef.current.setOpacity?.(opacity); } catch (e) { debugWarn('ThreeLayer.setOpacity', e); }
  }, [opacity]);

  return null;
});

export const ThreeLayer = memo(ThreeLayerInner);
