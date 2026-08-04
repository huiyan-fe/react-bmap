/**
 * 安全序列化 SDK 结果对象。
 * SDK 结果可能只有方法（无可枚举属性），或有非标准属性。
 * 此函数尝试多种方式提取数据。
 */
export function safeStringifySdkResult(data: unknown): string {
  if (data === null || data === undefined) return String(data);
  if (typeof data !== 'object') return String(data);

  const obj = data as any;
  const result: Record<string, unknown> = {};

  // 1. 可枚举属性
  try {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      result[k] = v instanceof HTMLElement ? '<DOM>' : typeof v === 'function' ? '<fn>' : v;
    }
  } catch { /* noop */ }

  // 2. 原型上的 getXxx() 方法
  try {
    const proto = Object.getPrototypeOf(obj);
    if (proto && proto !== Object.prototype) {
      const allProps = [
        ...Object.getOwnPropertyNames(proto),
        ...Object.getOwnPropertyNames(obj),
      ];
      for (const k of allProps) {
        if (result[k] !== undefined) continue;
        try {
          if (typeof obj[k] === 'function') {
            // 调用无参方法（getXxx / xxx）
            const val = obj[k]();
            if (val !== undefined && val !== null) {
              if (val instanceof HTMLElement || val instanceof Node) {
                result[k + '()'] = '<DOM>';
              } else if (typeof val === 'object') {
                // 递归一层
                const subResult: Record<string, unknown> = {};
                try {
                  const subProto = Object.getPrototypeOf(val);
                  if (subProto && subProto !== Object.prototype) {
                    for (const sk of Object.getOwnPropertyNames(subProto)) {
                      if (typeof (val as any)[sk] === 'function') {
                        try {
                          const sv = (val as any)[sk]();
                          if (sv !== undefined && sv !== null) subResult[sk + '()'] = sv;
                        } catch { /* noop */ }
                      }
                    }
                  }
                  if (Object.keys(subResult).length > 0) {
                    result[k + '()'] = subResult;
                  } else {
                    // 尝试 JSON.stringify
                    try {
                      result[k + '()'] = JSON.parse(JSON.stringify(val, (j: string, v: unknown) =>
                        v instanceof HTMLElement ? '<DOM>' : typeof v === 'function' ? '<fn>' : v
                      ));
                    } catch { result[k + '()'] = String(val); }
                  }
                } catch { result[k + '()'] = String(val); }
              } else {
                result[k + '()'] = val;
              }
            }
          }
        } catch { /* noop */ }
      }
    }
  } catch { /* noop */ }

  // 如果还是空，显示对象信息
  if (Object.keys(result).length === 0) {
    const protoName = Object.getPrototypeOf(obj)?.constructor?.name ?? 'unknown';
    return JSON.stringify({
      _type: protoName,
      _keys: Object.keys(obj),
      _protoProps: Object.getOwnPropertyNames(Object.getPrototypeOf(obj) ?? {}),
    }, null, 2);
  }

  return JSON.stringify(result, (k, v) => {
    if (v instanceof HTMLElement || v instanceof Node) return '<DOM>';
    if (typeof v === 'function') return '<fn>';
    if (typeof v === 'object' && v !== null) {
      // 避免循环
      try { JSON.stringify(v); return v; }
      catch { return '<circular>'; }
    }
    return v;
  }, 2);
}
