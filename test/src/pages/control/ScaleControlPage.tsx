import { useState } from 'react';
import {
  BMAP_ANCHOR_BOTTOM_LEFT,
  BMAP_UNIT_IMPERIAL,
  BMAP_UNIT_METRIC,
  ScaleControl,
} from 'react-bmap';
import type { ControlAnchor, ScaleControlProps } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, DEFAULT_CONTROL_OFFSET, PropsView, SizeInputs, VisibilityControl } from './shared';

export function ScaleControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_BOTTOM_LEFT);
  const [offset, setOffset] = useState<ScaleControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [unit, setUnit] = useState<ScaleControlProps['unit']>(BMAP_UNIT_METRIC as any);

  const controlProps: ScaleControlProps = { visible, anchor, offset, unit };

  return (
    <ControlPageLayout title="ScaleControl" capability="ScaleControl" controls={(
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
          <h3>unit</h3>
          <select value={unit ?? ''} onChange={e => setUnit(e.target.value === '' ? undefined : e.target.value as ScaleControlProps['unit'])}>
            <option value="">默认</option>
            <option value={BMAP_UNIT_METRIC}>metric</option>
            <option value={BMAP_UNIT_IMPERIAL}>imperial</option>
          </select>
        </section>
        <PropsView value={controlProps} />
      </>
    )}>
      <ScaleControl visible={visible} anchor={anchor} offset={offset} unit={unit} />
    </ControlPageLayout>
  );
}
