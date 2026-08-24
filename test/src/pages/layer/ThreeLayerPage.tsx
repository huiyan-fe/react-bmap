/**
 * ThreeLayer 测试页 — v4+，依赖 three.js。
 *
 * SDK 里 ThreeLayer 的构造函数第一件事就是 `if (!window.THREE) throw`，而 createLayerFactory
 * 会把构造异常吞掉返回 null。所以本页把 three.js 的加载状态单独列出来：类存在 ≠ 能构造成功。
 * 组件已是手写实现：props 覆盖 alpha / antialias / referCenter 与全部生命周期回调，
 * 场景操作走 ref 拿到的命令式句柄，不再需要页面本地补类型。
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThreeLayer } from 'react-bmap';
import type { ThreeLayerProps, ThreeLayerRef } from 'react-bmap';
import { BEIJING } from '../../TestProvider';
import { EventLog, logEvent } from '../control/shared';
import { DEFAULT_BASE_OPTIONS, LayerBaseOptionControls, LayerPageLayout, PropsView } from './shared';
import type { LayerBaseOptions } from './shared';

/** r150+ 已移除 build/three.min.js，这里固定用最后一个带 UMD 全局的版本 */
const THREE_CDN = 'https://unpkg.com/three@0.137.5/build/three.min.js';

type ThreeAny = any;

type ThreeStatus = 'idle' | 'loading' | 'ready' | 'error';

let threePromise: Promise<void> | null = null;

/** 按需注入 three.js UMD 包，重复调用复用同一个 promise */
function loadThree(): Promise<void> {
  if ((window as ThreeAny).THREE) return Promise.resolve();
  if (threePromise) return threePromise;
  threePromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = THREE_CDN;
    script.async = true;
    script.onload = () => ((window as ThreeAny).THREE ? resolve() : reject(new Error('脚本已加载但 window.THREE 不存在')));
    script.onerror = () => reject(new Error(`加载失败：${THREE_CDN}`));
    document.head.appendChild(script);
  });
  threePromise = threePromise.catch(err => { threePromise = null; throw err; });
  return threePromise;
}

const CODE = `// three.js 需要宿主工程自己引入，且必须挂到 window.THREE 上
// 世界坐标单位约等于米，zoom 11 下 500 米的盒子只有几个像素，官方 demo 用的是 15
const layerRef = useRef<ThreeLayerRef>(null);

<Map defaultCenter={center} defaultZoom={16}>
  <ThreeLayer
    ref={layerRef}
    zIndex={5}
    antialias
    onInit={(renderer, scene, camera, layer) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(500, 500, 500),
        new THREE.MeshBasicMaterial({ color: 0x1890ff }),
      );
      // 句柄的 toWorld 内部走 map.toFormatCoords（实例上的 convertLngLat 在 v4 里是坏的）
      const [x, y] = layer.toWorld(center)!;
      mesh.position.set(x, y, 250);
      layer.add(mesh);
      layer.triggerRepaint();  // 不调这一下 animate() 会直接 return，画面不更新
    }}
  />
</Map>`;

export function ThreeLayerPage() {
  const [base, setBase] = useState<LayerBaseOptions>({ ...DEFAULT_BASE_OPTIONS });
  const [alpha, setAlpha] = useState(false);
  const [antialias, setAntialias] = useState(true);
  const [threeStatus, setThreeStatus] = useState<ThreeStatus>((window as ThreeAny).THREE ? 'ready' : 'idle');
  const [threeError, setThreeError] = useState('');
  const [cubeOn, setCubeOn] = useState(true);
  const [cubeSize, setCubeSize] = useState(500);
  const [logs, setLogs] = useState<string[]>([]);

  const layerRef = useRef<ThreeLayerRef>(null);
  const meshRef = useRef<ThreeAny>(null);
  // 图层级 opacity 对 ThreeLayer 是死参数（组件已把它标成 @deprecated 并在控制台提醒一次）：
  // NormalLayer 构造函数存了 this.opacity，但 ThreeLayer 的 render 只把矩阵交给
  // renderer.render(scene, camera)，整块原型里一次都没读它。three.js 场景的透明度只能落在
  // 材质上，所以这里把滑块的值转给 mesh 的 material。
  const materialOpacity = base.opacity ?? 1;
  // onInit 只在图层创建时跑，闭包里读不到最新 state，这里用 ref 兜住
  const cubeOnRef = useRef(cubeOn);
  const cubeSizeRef = useRef(cubeSize);
  const opacityRef = useRef(materialOpacity);
  cubeOnRef.current = cubeOn;
  cubeSizeRef.current = cubeSize;
  opacityRef.current = materialOpacity;

  const log = useCallback((msg: string) => logEvent(setLogs, msg), []);

  const requestThree = useCallback(() => {
    setThreeStatus('loading');
    setThreeError('');
    loadThree().then(
      () => setThreeStatus('ready'),
      (err: Error) => { setThreeStatus('error'); setThreeError(err.message); },
    );
  }, []);

  useEffect(() => { if (threeStatus === 'idle') requestThree(); }, [threeStatus, requestThree]);

  /** 造一个新 mesh 挂进场景 —— 图层销毁时 SDK 会 dispose 场景内容，所以每次都造新的 */
  const addCube = useCallback((layer: ThreeLayerRef, size: number) => {
    const THREE = (window as ThreeAny).THREE;
    if (!THREE) return;
    // 句柄的 toWorld 走 map.toFormatCoords；拿不到地图时返回 null
    const world = layer.toWorld(BEIJING);
    if (!world) {
      log('addCube 跳过：toWorld 拿不到世界坐标');
      return;
    }
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshBasicMaterial({
        color: 0x1890ff,
        // transparent 为 false 时 three.js 直接忽略 opacity，所以两个值一起给
        transparent: opacityRef.current < 1,
        opacity: opacityRef.current,
      }),
    );
    const [x, y] = world;
    // z 轴朝天，底面贴地
    mesh.position.set(x, y, size / 2);
    meshRef.current = mesh;
    layer.add(mesh);
    // add 只会 doOnceDraw 一次，而 animate() 在 needsUpdate 为假时直接 return，
    // 所以这里补一次 triggerRepaint 让画面真的刷出来
    layer.triggerRepaint();
    log(`立方体已添加：边长 ${size}，透明度 ${opacityRef.current}，世界坐标 (${x.toFixed(1)}, ${y.toFixed(1)})`);
  }, [log]);

  const removeCube = useCallback((layer: ThreeLayerRef) => {
    if (!meshRef.current) return;
    layer.remove(meshRef.current);
    meshRef.current = null;
    layer.triggerRepaint();
  }, []);

  // 立方体开关 / 尺寸都不走图层重建：组件把回调存在 ref 里，改回调不会进 ctorKey，
  // onInit 不会重跑，所以场景变化只能走 ref 句柄的 add / remove。
  const toggleCube = useCallback((next: boolean) => {
    setCubeOn(next);
    const layer = layerRef.current;
    if (!layer) return;
    if (next) addCube(layer, cubeSizeRef.current);
    else removeCube(layer);
  }, [addCube, removeCube]);

  const changeCubeSize = useCallback((size: number) => {
    setCubeSize(size);
    const layer = layerRef.current;
    if (!layer || !cubeOnRef.current) return;
    removeCube(layer);
    addCube(layer, size);
  }, [addCube, removeCube]);

  // opacity 不再触发图层重建（它走 setOpacity，且对 ThreeLayer 本身无效），
  // 这里把值落到当前 mesh 的材质上并重绘，保证滑块立即生效。
  useEffect(() => {
    const layer = layerRef.current;
    const mesh = meshRef.current;
    if (!layer || !mesh?.material) return;
    mesh.material.transparent = materialOpacity < 1;
    mesh.material.opacity = materialOpacity;
    mesh.material.needsUpdate = true;
    layer.triggerRepaint();
  }, [materialOpacity]);

  const hooks: Pick<ThreeLayerProps, 'onInit' | 'onDestroy' | 'onHide' | 'onShow'> = {
    onInit(renderer, scene, camera, layer) {
      log(`onInit: renderer=${!!renderer} scene=${!!scene} camera=${!!camera}`);
      if (cubeOnRef.current) addCube(layer, cubeSizeRef.current);
    },
    onDestroy() {
      log('onDestroy');
      meshRef.current = null;
    },
    onHide() { log('onHide'); },
    onShow() { log('onShow'); },
  };

  // opacity 故意不往下传：组件已把它标成 @deprecated，传了只会换来一条控制台警告，
  // 本页把这个值接到了立方体材质上（见 materialOpacity）。
  const { opacity: _ignoredOpacity, ...baseWithoutOpacity } = base;

  const layerProps: ThreeLayerProps = {
    ...baseWithoutOpacity,
    alpha,
    antialias,
    ...hooks,
  };

  const callInstance = (name: 'triggerRepaint' | 'triggerStop' | 'refreshMap') => {
    const layer = layerRef.current;
    if (!layer?.raw) { log(`${name}: 实例不可用（图层未创建）`); return; }
    layer[name]();
    log(`${name}() 已调用`);
  };

  const pickCenter = () => {
    const layer = layerRef.current;
    if (!layer?.raw) { log('pick: 实例不可用'); return; }
    const map = layer.raw.getMap();
    const width = map?.width ?? map?.getContainer?.()?.offsetWidth ?? 0;
    const height = map?.height ?? map?.getContainer?.()?.offsetHeight ?? 0;
    const hit = layer.pick(width / 2, height / 2);
    log(`pick(${Math.round(width / 2)}, ${Math.round(height / 2)}) → ${hit ? `${hit.length} 个对象` : 'null'}`);
  };

  const THREE_TAG: Record<ThreeStatus, string> = {
    idle: 'three.js 未加载',
    loading: 'three.js 加载中',
    ready: 'three.js 已就绪',
    error: 'three.js 加载失败',
  };

  return (
    <LayerPageLayout
      title="ThreeLayer"
      capability="ThreeLayer"
      // 图层世界坐标是墨卡托米，缩放级别直接决定盒子的屏幕尺寸：
      // 实测 500 米立方体在 zoom 11 只有 ~10px，16 才有约 15000px 的可见面积
      zoom={16}
      versionNote="@since 4.0。SDK 构造函数里 window.THREE 缺失会直接 throw，异常被工厂吞掉后图层静默变成 null —— 所以上面的「SDK 类存在」标签在这一页不代表能用，要看下面的 three.js 状态。"
      code={CODE}
      controls={
        <>
          <section>
            <h3>three.js 依赖</h3>
            <span className={`cap-tag ${threeStatus === 'ready' ? 'ok' : 'no'}`}>{THREE_TAG[threeStatus]}</span>
            <div className="btn-group">
              <button onClick={requestThree} disabled={threeStatus === 'loading' || threeStatus === 'ready'}>
                加载 three.js
              </button>
            </div>
            {threeError && <p className="muted small" style={{ color: '#cf1322' }}>{threeError}</p>}
            <p className="muted small">
              CDN：<code>{THREE_CDN}</code>（r150+ 已移除 UMD 包，这里取最后一个带 window.THREE 全局的版本）。
              未就绪时本页不渲染 ThreeLayer，避免看到「构造失败 → 静默无图层」的假象。
            </p>
          </section>
          <section>
            <h3>构造参数</h3>
            <label className="checkbox-row">
              <input type="checkbox" checked={alpha} onChange={e => setAlpha(e.target.checked)} />
              alpha（WebGLRenderer）
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={antialias} onChange={e => setAntialias(e.target.checked)} />
              antialias（WebGLRenderer）
            </label>
            <p className="muted small">
              不传 referCenter：v4 的 ThreeLayer.render 取的是 _updatePolyLayerMatrix()（不带 center），
              世界坐标只能相对默认墨卡托基准点，传了 referCenter 反而对不上。
              改这两个开关会重建图层，日志里能看到 onDestroy → onInit。
            </p>
          </section>
          <section>
            <h3>场景内容</h3>
            <label className="checkbox-row">
              <input type="checkbox" checked={cubeOn} onChange={e => toggleCube(e.target.checked)} />
              在地图中心放一个立方体
            </label>
            <label className="checkbox-row" style={{ justifyContent: 'space-between' }}>
              边长：{cubeSize}
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={cubeSize}
                onChange={e => changeCubeSize(Number(e.target.value))}
              />
            </label>
            <p className="muted small">
              走 ref 句柄的 layer.add / layer.remove 直接改场景：回调存在组件内部的 ref 里，
              不进 ctorKey，开关和边长的变化不会触发重建。
              边长单位约等于米（世界坐标来自 map.toFormatCoords 的墨卡托偏移），默认 500 与官方 demo 一致；
              屏幕尺寸随缩放级别线性变化，本页默认 zoom 16，缩到 11 附近盒子只剩几个像素；
              俯视角下看到的是立方体顶面，把地图倾斜（setTilt）才能看出体积。
              另外「公共参数」里的 opacity 在 SDK 层面对 ThreeLayer 无效，本页把它接到了立方体材质上
              （当前 {materialOpacity}），详见下面的「已知限制」。
            </p>
          </section>
          <section>
            <h3>实例方法</h3>
            <div className="btn-group" style={{ flexWrap: 'wrap' }}>
              <button onClick={() => callInstance('triggerRepaint')}>triggerRepaint</button>
              <button onClick={() => callInstance('triggerStop')}>triggerStop</button>
              <button onClick={() => callInstance('refreshMap')}>refreshMap</button>
              <button onClick={pickCenter}>pick（容器中心）</button>
            </div>
            <p className="muted small">
              这里的方法都来自组件 ref 暴露的句柄（<code>useRef&lt;ThreeLayerRef&gt;</code>）。ThreeLayer 只在
              needsUpdate 为真时持续 raf 重绘，triggerStop 之后要靠 triggerRepaint / refreshMap 才会再画。
              pick 用的是 SDK 内部的 THREE.Raycaster，命中场景里的立方体才会返回非空数组。
            </p>
          </section>
          <LayerBaseOptionControls value={base} onChange={setBase} />
          <PropsView value={layerProps} />
          <EventLog logs={logs} />
          <section>
            <h3>已知限制</h3>
            <p className="muted small">
              onRender 会整体替换默认的 renderer.render(scene, camera)，接上就必须自己渲染，
              所以本页只接 onInit / onDestroy / onHide / onShow。
              实例上的 convertLngLat 在 v4 里是坏的（内部把 map.toFormatCoords 这个函数当带 setCenter 的对象用），
              组件的 layer.toWorld 绕开了它，直接走 map.toFormatCoords。
              referCenter 对 ThreeLayer 也是死参数：SDK 的 setRefCenter 只改 this.center 并调 parseData，
              而 ThreeLayer 既没有 parseData，render 取的也是不带 center 的 _updatePolyLayerMatrix()。
              还有 opacity：NormalLayer 的构造函数会存 this.opacity、也提供 setOpacity/getOpacity，
              但 ThreeLayer 的 render 只做 renderer.render(scene, camera)，整块原型里从不读它 ——
              真正消费它的是 LineLayer / FillLayer 这类自己写 shader、把它当 u_opacity uniform 的图层。
              组件已把它标成 @deprecated 并在开发环境提醒一次；three.js 场景的透明度只能设在材质
              （transparent + opacity）或 renderer 上，所以本页把滑块的值转发给了立方体的 material。
            </p>
          </section>
        </>
      }
    >
      {threeStatus === 'ready' ? <ThreeLayer ref={layerRef} {...layerProps} /> : null}
    </LayerPageLayout>
  );
}
