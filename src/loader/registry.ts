import type { BMapVersion, LoadKeyComponents } from '../types';
import { stableHash } from './stableHash';

interface RegistryEntry {
  promise: Promise<unknown>;
  loadKey: string;
  components: LoadKeyComponents;
}

const globalRegistry: Map<string, RegistryEntry> = new Map();

export function buildLoadKey(c: LoadKeyComponents): string {
  return stableHash({
    v: c.version,
    ak: c.ak,
    host: c.serviceHost ?? '',
    lang: c.language ?? '',
    plugins: (c.plugins ?? []).slice().sort(),
  });
}

export function getExisting(loadKey: string): RegistryEntry | undefined {
  return globalRegistry.get(loadKey);
}

export function register(loadKey: string, components: LoadKeyComponents, promise: Promise<unknown>): void {
  globalRegistry.set(loadKey, { promise, loadKey, components });
  promise.catch(() => globalRegistry.delete(loadKey));
}

export function getAllEntries(): RegistryEntry[] {
  return Array.from(globalRegistry.values());
}

export function detectConflict(loadKey: string, requested: LoadKeyComponents): LoadKeyComponents | null {
  // 同页面只能加载一个版本/AK 组合
  for (const entry of globalRegistry.values()) {
    if (entry.loadKey !== loadKey) return entry.components;
  }
  void requested;
  return null;
}

export type { BMapVersion, LoadKeyComponents };
