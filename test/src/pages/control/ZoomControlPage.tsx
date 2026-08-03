import { useState } from 'react';
import {
  BMAP_ANCHOR_BOTTOM_RIGHT,
  ZoomControl,
} from 'react-bmap';
import type { ControlAnchor, ZoomControlProps } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, PropsView, SizeInputs, VisibilityControl } from './shared';

export function ZoomControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_BOTTOM_RIGHT);
  const [offset, setOffset] = useState<ZoomControlProps['offset']>({ width: 15, height: 20 });

  const controlProps: ZoomControlProps = { visible, anchor, offset };

  return (
    <ControlPageLayout title="ZoomControl" capability="ZoomControl" versionNote="v4+ 控件，v3 不支持。" controls={(
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
      <ZoomControl visible={visible} anchor={anchor} offset={offset} />
    </ControlPageLayout>
  );
}
