export function getOptions(props: Record<string, any>, optionKeys: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of optionKeys) {
    if (props[key] !== undefined) {
      result[key] = props[key];
    }
  }
  return result;
}
