import { describe, it, expect } from 'vitest';
import { CustomControl } from '../CustomControl';
import { renderInMapContext } from '../../../__tests__/renderWithMap';
import { BMAP_ANCHOR_TOP_RIGHT } from '../../../constants';

describe('CustomControl', () => {
  it('挂载时调用 createCustomControl + addControl，children 通过 portal 渲染进 domCreate() 返回的容器', () => {
    const { driver } = renderInMapContext(
      <CustomControl anchor={BMAP_ANCHOR_TOP_RIGHT}>
        <button>我的控件</button>
      </CustomControl>,
    );
    expect(driver.createCustomControl).toHaveBeenCalledTimes(1);
    const [domCreate, ctorOpts] = driver.createCustomControl.mock.calls[0];
    expect(typeof domCreate).toBe('function');
    expect(ctorOpts).toEqual({ anchor: BMAP_ANCHOR_TOP_RIGHT });
    expect(driver.addControl).toHaveBeenCalledTimes(1);
    // fakeDriver 不会像真实 SDK 那样调用 initialize() 把容器 append 到 document，
    // 这里直接拿 domCreate() 返回的容器验证 children 已 portal 进去。
    const container = domCreate();
    expect(container.querySelector('button')?.textContent).toBe('我的控件');
  });

  it('visible=false 时调用 hideControl', () => {
    const { driver, rerender } = renderInMapContext(
      <CustomControl visible={false}>
        <span>内容</span>
      </CustomControl>,
    );
    expect(driver.hideControl).toHaveBeenCalled();
    rerender(
      <CustomControl visible>
        <span>内容</span>
      </CustomControl>,
    );
    expect(driver.showControl).toHaveBeenCalled();
  });

  it('卸载时调用 removeControl', () => {
    const { driver, unmount } = renderInMapContext(
      <CustomControl>
        <span>内容</span>
      </CustomControl>,
    );
    unmount();
    expect(driver.removeControl).toHaveBeenCalledTimes(1);
  });
});

