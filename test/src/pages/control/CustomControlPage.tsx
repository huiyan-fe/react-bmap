import { useState } from 'react';
import {
  BMAP_ANCHOR_TOP_LEFT,
  CustomControl,
} from 'react-bmap';
import type { CustomControlProps, ControlAnchor } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, DEFAULT_CONTROL_OFFSET, PropsView, SizeInputs, VisibilityControl } from './shared';

export function CustomControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_TOP_LEFT);
  const [offset, setOffset] = useState<CustomControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [count, setCount] = useState(0);

  const controlProps: Omit<CustomControlProps, 'children'> = { visible, anchor, offset };

  return (
    <ControlPageLayout title="CustomControl" controls={(
      <>
        <VisibilityControl visible={visible} onChange={setVisible} />
        <section>
          <h3>anchor</h3>
          <AnchorSelect value={anchor} onChange={setAnchor} />
        </section>
        <section>
          <h3>offset</h3>
          <SizeInputs value={offset} onChange={setOffset} />
        </section>
        <section>
          <h3>说明</h3>
          <p className="muted small">
            children 会被 portal 到挂载在地图容器上的固定像素位置（不随地图平移/缩放移动），
            与绑定地理坐标的 CustomOverlay 是两套不同的定位机制。
          </p>
        </section>
        <PropsView value={controlProps} />
      </>
    )}>
      <CustomControl visible={visible} anchor={anchor} offset={offset}>
        <div style={{
          background: '#fff', border: '1px solid #ccc', borderRadius: 4,
          padding: '6px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: 13,
        }}>
          <div>自定义控件</div>
          <button onClick={() => setCount(c => c + 1)}>点击 +1（{count}）</button>
        </div>
      </CustomControl>
    </ControlPageLayout>
  );
}
