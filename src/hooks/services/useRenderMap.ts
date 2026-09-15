/**
 * 解析 service hook 在地图上渲染结果所用的 map handle。
 *
 * 优先级：
 * 1. 显式传入的 `renderOptions.map`（最高，外层用法必须这样传）；
 * 2. 否则回退到当前所在 `<Map>` 子树的 context map —— 即 hook 被用在 `<Map>` **内部**时自动获取；
 * 3. 都没有则 `undefined`（hook 用在 `<Map>` 外层且未显式传）。
 *
 * 这里用 `useContext(MapContext)` 而不是 `useMapContext()`：后者在 `<Map>` 外会抛错，
 * 而 service hook 恰恰常用在 `<Map>` 外层，直接读 context 拿到 null 即可安全回退。
 *
 * 返回的是**稳定引用**的 handle（来自显式 prop 或 `<Map>` 的 state），可直接放进 effect 依赖，
 * 地图从未就绪(null)变为就绪(handle)时会触发 effect 重跑、把 map 挂到服务上。
 */
import { useContext } from 'react';
import { MapContext } from '../../context/MapContext';
import { isHandle } from '../../utils/handle';
import type { MapHandle } from '../../types';

export function useRenderMap(explicit?: unknown): MapHandle | undefined {
  const ctx = useContext(MapContext);
  const picked = explicit ?? ctx?.map ?? undefined;
  return isHandle(picked) ? (picked as MapHandle) : undefined;
}
