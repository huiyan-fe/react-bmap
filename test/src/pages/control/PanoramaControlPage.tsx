import { useState } from 'react';
import {
  BMAP_ANCHOR_TOP_RIGHT,
  PanoramaControl,
} from 'react-bmap';
import type { ControlAnchor, PanoramaControlProps } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, DEFAULT_CONTROL_OFFSET, PropsView, SizeInputs, VisibilityControl } from './shared';

export function PanoramaControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_TOP_RIGHT);
  const [offset, setOffset] = useState<PanoramaControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const controlProps: PanoramaControlProps = { visible, anchor, offset };

  return (
    <ControlPageLayout title="PanoramaControl" capability="PanoramaControl" controls={(
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
      <PanoramaControl visible={visible} anchor={anchor} offset={offset} />
    </ControlPageLayout>
  );
}
