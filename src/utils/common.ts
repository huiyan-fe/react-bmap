export const isString = (str: unknown): str is string => {
  return Object.prototype.toString.call(str) === '[object String]';
};

export function objectMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return Object.assign({}, target, ...sources) as T;
}
