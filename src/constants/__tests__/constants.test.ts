import { describe, it, expect } from 'vitest';
import * as constants from '../index';

describe('constants 全量常量值', () => {
  it('SymbolShapeType 覆盖 1-14 且首尾正确', () => {
    expect(constants.BMap_Symbol_SHAPE_CIRCLE).toBe(1);
    expect(constants.BMap_Symbol_SHAPE_CLOCK).toBe(14);
  });

  it('ControlAnchor 九宫格', () => {
    expect(constants.BMAP_ANCHOR_TOP_LEFT).toBe(0);
    expect(constants.BMAP_ANCHOR_CENTER).toBe(8);
  });

  it('StatusCodes 与百度定义一致', () => {
    expect(constants.BMAP_STATUS_SUCCESS).toBe(0);
    expect(constants.BMAP_STATUS_TIMEOUT).toBe(8);
  });

  it('MapTypeId 为字符串枚举', () => {
    expect(constants.BMAP_NORMAL_MAP).toBe('B_NORMAL_MAP');
    expect(constants.BMAP_EARTH_MAP).toBe('B_EARTH_MAP');
  });

  it('PointDensityType 非连续值', () => {
    expect(constants.BMAP_POINT_DENSITY_HIGH).toBe(200);
    expect(constants.BMAP_POINT_DENSITY_LOW).toBe(50);
  });
});
