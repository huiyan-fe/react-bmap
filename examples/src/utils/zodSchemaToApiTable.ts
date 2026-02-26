import type { z } from 'zod';

export interface ApiTableRow {
  name: string;
  type: string;
  required: boolean;
  default: string;
  description: string;
}

const SKIP_PROPS = new Set(['map']);

function getDef(field: z.ZodTypeAny): any {
  const f = field as any;
  return f._zod?.def ?? f._def;
}

function unwrapOptional(field: z.ZodTypeAny, depth = 0): z.ZodTypeAny {
  if (depth > 5) return field; // prevent infinite loop
  const def = getDef(field);
  if (!def) return field;
  const typeName = def.typeName as string;
  const type = def.type as string;
  if (typeName === 'ZodOptional' || typeName === 'ZodDefault' || type === 'optional' || type === 'default') {
    const inner = def.innerType ?? def.type;
    if (inner && typeof inner === 'object') return unwrapOptional(inner as z.ZodTypeAny, depth + 1);
  }
  return field;
}

function getTypeName(field: z.ZodTypeAny): string {
  const unwrapped = unwrapOptional(field);
  const def = getDef(unwrapped);
  if (!def) return 'any';
  const typeName = (def.typeName as string) ?? (def.type as string) ?? '';
  if (typeName.includes('String') || typeName === 'string') return 'string';
  if (typeName.includes('Number') || typeName === 'number') return 'number';
  if (typeName.includes('Boolean') || typeName === 'boolean') return 'boolean';
  if (typeName.includes('Any') || typeName === 'any') return 'any';
  if (typeName.includes('Enum') || typeName === 'enum') {
    const values = def.values ?? def.options;
    return values ? (values as unknown[]).map((v) => `'${v}'`).join(' | ') : 'enum';
  }
  if (typeName.includes('Union') || typeName === 'union') {
    const options = def.options ?? def.members;
    return options ? (options as z.ZodTypeAny[]).map(getTypeName).join(' | ') : 'union';
  }
  if (typeName.includes('Array') || typeName === 'array') {
    const inner = def.type ?? def.element;
    return inner ? `${getTypeName(inner as z.ZodTypeAny)}[]` : 'array';
  }
  if (typeName.includes('Object') || typeName === 'object') return 'object';
  if (typeName.includes('Record') || typeName === 'record') return 'Record<string, any>';
  if (typeName.includes('Function') || typeName === 'function') return 'function';
  if (typeName.includes('Tuple') || typeName === 'tuple') return 'tuple';
  return typeName ? typeName.replace(/^Zod/, '').toLowerCase() : 'any';
}

function getDescription(field: z.ZodTypeAny): string {
  const f = field as any;
  // Zod 4: .describe() 注册到 globalRegistry，通过 .meta() 获取
  if (typeof f.meta === 'function') {
    const meta = f.meta();
    if (meta?.description) return String(meta.description);
  }
  // Zod 3 / 兜底: _def.description
  const def = getDef(field);
  return (def?.description as string) ?? '';
}

function isRequired(field: z.ZodTypeAny): boolean {
  const def = getDef(field);
  if (!def) return true;
  const typeName = (def.typeName as string) ?? (def.type as string) ?? '';
  if (typeName.includes('Optional') || typeName.includes('Default') || typeName === 'optional' || typeName === 'default') {
    return false;
  }
  return true;
}

export function zodSchemaToApiTable(
  schema: z.ZodObject<z.ZodRawShape>,
  options?: { skipProps?: string[] }
): ApiTableRow[] {
  const skip = new Set([...SKIP_PROPS, ...(options?.skipProps ?? [])]);
  const shape = schema.shape;
  if (!shape || typeof shape !== 'object') return [];

  return Object.entries(shape)
    .filter(([key]) => !skip.has(key))
    .map(([name, field]) => ({
      name,
      type: getTypeName(field as z.ZodTypeAny),
      required: isRequired(field as z.ZodTypeAny),
      default: '-',
      description: getDescription(field as z.ZodTypeAny),
    }));
}
