import { useState } from 'react';
import {
  BMAP_ANCHOR_TOP_RIGHT,
  NavigationControl3D,
} from 'react-bmap';
import type { ControlAnchor, NavigationControl3DProps } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, PropsView, SizeInputs, VisibilityControl } from './shared';

export function NavigationControl3DPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_TOP_RIGHT);
  const [offset, setOffset] = useState<NavigationControl3DProps['offset']>({ width: 2, height: 80 });

  const controlProps: NavigationControl3DProps = { visible, anchor, offset };

  return (
    <ControlPageLayout title="NavigationControl3D" capability="NavigationControl3D" versionNote="v4+ 控件，v3 不支持。" controls={(
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
        <PropsView value={controlProps} />
      </>
    )}>
      <NavigationControl3D visible={visible} anchor={anchor} offset={offset} />
    </ControlPageLayout>
  );
}
