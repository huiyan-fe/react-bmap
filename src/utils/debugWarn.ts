/**
 * 开发期非抛出型告警。
 *
 * 用途：包住那些「用户明确要求某个操作、但 SDK 静默失败」的 catch —— 例如
 * Layer.setData 没渲染、Map 的属性 setter 没生效。这些位置以前是 `catch { /* noop *\/ }`，
 * 故障被完全吞掉，开发时无从排查。
 *
 * 设计约束：
 * - 只在非 production 打印（对齐 v4Driver 里的 env 判断），避免污染线上 console。
 * - 绝不抛异常：这些 catch 多在 React effect 回调里，抛出会破坏渲染树。日志本身也 try 兜底。
 * - 不走 reportUnsupported：那是「能力不支持」语义、且 throw 模式会抛错；这里是
 *   受支持操作的运行时失败，只需可观测，不改变控制流。
 */
export function debugWarn(context: string, cause?: unknown): void {
  if (cause !== undefined) devWarn(`${context} 调用失败：`, cause);
  else devWarn(`${context} 调用失败`);
}

/**
 * 开发期提示（原文输出，不追加「调用失败」）。
 *
 * 用途：不是调用失败、但用户几乎一定会误解的场景 —— 例如把某个 option prop 改回
 * undefined，框架没有 SDK 默认值可以还原，只能保持原状。这类「符合实现、但违背直觉」
 * 的行为不说出来就是静默失效。
 */
export function devWarn(message: string, cause?: unknown): void {
  try {
    // 不依赖 @types/node：从 globalThis 上安全读取，浏览器里 process 不存在时按 dev 处理
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    if (env?.NODE_ENV === 'production') return;
    if (typeof console === 'undefined') return;
    if (cause !== undefined) console.warn(`[react-bmap] ${message}`, cause);
    else console.warn(`[react-bmap] ${message}`);
  } catch {
    // 日志绝不能反过来把调用方搞崩
  }
}
