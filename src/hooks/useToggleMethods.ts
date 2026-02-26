import { useEffect } from 'react';

type ToggleMethods = Record<
  string,
  [enableMethod: string, disableMethod: string]
>;

export function useToggleMethods(
  obj: any,
  props: Record<string, unknown>,
  toggleMethods: ToggleMethods
) {
  useEffect(() => {
    if (!obj) return;
    for (const [key, [enable, disable]] of Object.entries(toggleMethods)) {
      if (props[key] !== undefined) {
        if (props[key]) {
          obj[enable]?.();
        } else {
          obj[disable]?.();
        }
      }
    }
  }, [obj, props, toggleMethods]);
}
