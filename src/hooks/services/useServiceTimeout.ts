/**
 * useServiceTimeout — service hook 共用的「回调兜底」工具。
 *
 * 背景：百度 JSAPI 的检索类服务在部分失败场景（如 AK 未开通该服务返回 error:240、
 * 或网络异常）下，**根本不会触发回调**，导致 hook 的 loading 永远卡在 true、
 * data/error 都拿不到任何信号（表现为「点了没反应，一直转圈」）。
 *
 * 该工具给每次异步请求挂一个超时定时器：回调先到就 disarm；超时先到就把请求判定为失败，
 * 让调用方把 loading 收回并抛出 error。纯附加逻辑——回调正常返回时行为完全不变。
 */
import { useCallback, useEffect, useRef } from 'react';

/** 默认超时（毫秒）。取较宽松的 10s，避免慢网误伤。 */
export const SERVICE_TIMEOUT_MS = 10000;

/** 统一的超时错误，供各 hook 复用。 */
export function serviceTimeoutError(): Error {
  return new Error(
    '[react-bmap] 服务请求超时：SDK 回调未返回，可能是 AK 未开通该服务、请求被拒或网络异常',
  );
}

export interface ServiceTimeoutControl {
  /** 发起请求时调用：arm 一个超时；超时触发 onTimeout。重复 arm 会覆盖上一个。 */
  arm: (onTimeout: () => void, ms?: number) => void;
  /** 回调到达 / 取消 / 卸载时调用：清掉未触发的超时。 */
  clear: () => void;
}

export function useServiceTimeout(): ServiceTimeoutControl {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 组件卸载时清掉挂起的定时器，避免对已卸载组件 setState
  useEffect(() => clear, [clear]);

  const arm = useCallback((onTimeout: () => void, ms: number = SERVICE_TIMEOUT_MS) => {
    clear();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onTimeout();
    }, ms);
  }, [clear]);

  return { arm, clear };
}
