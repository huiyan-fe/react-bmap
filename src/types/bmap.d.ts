/**
 * BMap (2D) and BMapGL type declarations
 * Both based on @types/bmapgl-browser - same classes/methods, different namespace
 */
/// <reference types="bmapgl-browser" />

declare global {
  /**
   * BMap 2D API (api?v=2.0 or v=3.0)
   * Structurally identical to BMapGL, only namespace differs
   */
  const BMap: typeof BMapGL;
}

export {};
