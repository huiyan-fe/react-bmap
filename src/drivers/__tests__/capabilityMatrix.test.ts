import { describe, it, expect } from 'vitest';
import { CAPABILITY_MATRIX } from '../capabilityMatrix';

describe('CAPABILITY_MATRIX', () => {
  it('暴露 3.0 与 4.0 两套 ReadonlySet', () => {
    expect(CAPABILITY_MATRIX['3.0']).toBeInstanceOf(Set);
    expect(CAPABILITY_MATRIX['4.0']).toBeInstanceOf(Set);
  });

  it('全版本共有能力在两套矩阵里都存在', () => {
    for (const cap of ['Map', 'Map.setCenter', 'Marker', 'NavigationControl', 'LocalSearch']) {
      expect(CAPABILITY_MATRIX['3.0'].has(cap)).toBe(true);
      expect(CAPABILITY_MATRIX['4.0'].has(cap)).toBe(true);
    }
  });

  it('4.0-only 能力仅在 v4 矩阵', () => {
    for (const cap of ['Map.flyTo', 'Marker3D', 'Map.setMapStyleV2', 'GeoJSONLayer']) {
      expect(CAPABILITY_MATRIX['4.0'].has(cap)).toBe(true);
      expect(CAPABILITY_MATRIX['3.0'].has(cap)).toBe(false);
    }
  });

  it('3.0-only 能力仅在 v3 矩阵', () => {
    for (const cap of ['Map.enableMapClick', 'Map.setMapStyle', 'CustomLayer']) {
      expect(CAPABILITY_MATRIX['3.0'].has(cap)).toBe(true);
      expect(CAPABILITY_MATRIX['4.0'].has(cap)).toBe(false);
    }
  });

  it('LocationControl 别名两版本均可用', () => {
    expect(CAPABILITY_MATRIX['3.0'].has('LocationControl')).toBe(true);
    expect(CAPABILITY_MATRIX['4.0'].has('LocationControl')).toBe(true);
  });
});
