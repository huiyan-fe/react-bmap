import { describe, it, expect } from 'vitest';
import { wrapEvent } from '../event';

describe('wrapEvent', () => {
  it('缺失 type 时兜底为 unknown，raw 始终保留原始对象', () => {
    const raw = {};
    const ev = wrapEvent(raw);
    expect(ev.type).toBe('unknown');
    expect(ev.raw).toBe(raw);
    expect(ev.target).toBeNull();
  });

  it('透传 type 并绑定 target', () => {
    const target = { id: 1 };
    const ev = wrapEvent({ type: 'click' }, target);
    expect(ev.type).toBe('click');
    expect(ev.target).toBe(target);
  });

  it('point 优先 point，其次全小写 latlng，最后 latLng', () => {
    expect(wrapEvent({ point: 'P', latlng: 'L' }).point).toBe('P');
    expect(wrapEvent({ latlng: 'L', latLng: 'C' }).point).toBe('L');
    expect(wrapEvent({ latLng: 'C' }).point).toBe('C');
    expect(wrapEvent({}).point).toBeUndefined();
  });

  it('透传 pixel/overlay', () => {
    const ev = wrapEvent({ type: 'x', pixel: { x: 1, y: 2 }, overlay: { o: 1 } });
    expect(ev.pixel).toEqual({ x: 1, y: 2 });
    expect(ev.overlay).toEqual({ o: 1 });
  });
});
