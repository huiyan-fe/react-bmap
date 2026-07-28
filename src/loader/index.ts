import type { BMapVersion } from '../types';
import { buildLoadKey, getExisting, register, detectConflict, getAllEntries } from './registry';
import type { LoadKeyComponents } from '../types';

export interface LoaderResult {
  rawSDK: unknown;
  version: BMapVersion;
  loadKey: string;
}

/**
 * 加载 JSAPI 的统一入口。
 *
 * - 通过 @baidumap/jsapi-loader 加载。
 * - 缓存以 loadKey 去重，不重复注入脚本。
 * - 冲突（不同 loadKey）触发 onLoadConflict，返回已加载的 entry。
 * - **不修改 window.BMap / BMapGL 原型、不做命名空间别名**。
 */
export async function loadJSAPI(components: LoadKeyComponents, opts: {
  protocol?: 'http' | 'https';
  timeout?: number;
  globalConfig?: Record<string, unknown>;
  onLoadConflict?: (current: LoadKeyComponents, requested: LoadKeyComponents) => void;
}): Promise<LoaderResult> {
  const loadKey = buildLoadKey(components);
  const existing = getExisting(loadKey);
  if (existing) {
    const raw = await existing.promise;
    return { rawSDK: raw, version: components.version, loadKey };
  }

  const conflict = detectConflict(loadKey, components);
  if (conflict) {
    opts.onLoadConflict?.(conflict, components);
    // 不强行覆盖已加载的 SDK，返回已存在的
    for (const entry of getAllEntries()) {
      if (entry.loadKey !== loadKey) {
        const raw = await entry.promise;
        return { rawSDK: raw, version: entry.components.version, loadKey: entry.loadKey };
      }
    }
  }

  const promise = doLoad(components, opts);
  register(loadKey, components, promise);
  const rawSDK = await promise;
  return { rawSDK, version: components.version, loadKey };
}

async function doLoad(components: LoadKeyComponents, opts: {
  protocol?: 'http' | 'https';
  timeout?: number;
  globalConfig?: Record<string, unknown>;
}): Promise<unknown> {
  // @baidumap/jsapi-loader 默认 export 含 load/reset/getStatus
  const mod: any = await import('@baidumap/jsapi-loader');
  const Loader = mod.default ?? mod;

  // loader.load 返回对应的命名空间对象（3.0/4.0/未来版本 → window.BMap）
  // 注意：jsapi-loader 自身类型只声明了 '3.0' | 'gl' | '4.0'，但实际接受任意字符串。
  // 这里把用户传入的 version 原样透传（包括未来的 '4.1' / '5.0' 等）。
  return Loader.load({
    ak: components.ak,
    version: components.version as '3.0' | 'gl' | '4.0',
    ...(components.serviceHost ? { serviceHost: components.serviceHost } : {}),
    ...(opts.protocol ? { protocol: opts.protocol } : {}),
    ...(opts.timeout ? { timeout: opts.timeout } : {}),
    ...(opts.globalConfig ? { globalConfig: opts.globalConfig } : {}),
  });
}
