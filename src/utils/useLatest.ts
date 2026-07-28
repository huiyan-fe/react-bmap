import { useRef } from 'react';

/**
 * 始终持有最新值，避免在事件订阅中拿到旧闭包。
 * 用于 useMapEvent 等 Hook 内部：订阅一次，调用时读最新 handler。
 */
export function useLatest<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
