import { useState } from 'react';
import {
  BMAP_ANCHOR_BOTTOM_LEFT,
  BMAP_ANCHOR_BOTTOM_RIGHT,
  CopyrightControl,
} from 'react-bmap';
import type { ControlAnchor, CopyrightControlProps, CopyrightItem } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, DEFAULT_CONTROL_OFFSET, PropsView, SizeInputs, VisibilityControl } from './shared';

const DEFAULT_COPYRIGHTS: CopyrightItem[] = [
  { id: 1, content: '自定义版权 © react-bmap' },
];

export function CopyrightControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_BOTTOM_RIGHT);
  const [offset, setOffset] = useState<CopyrightControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [copyrights, setCopyrights] = useState<CopyrightItem[]>(DEFAULT_COPYRIGHTS);

  const controlProps: CopyrightControlProps = { visible, anchor, offset, copyrights };

  return (
    <ControlPageLayout title="CopyrightControl" capability="CopyrightControl" controls={(
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
          <h3>copyrights</h3>
          <input
            className="full-width"
            value={copyrights[0]?.content ?? ''}
            onChange={e => setCopyrights([{ id: 1, content: e.target.value }])}
          />
        </section>
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button onClick={() => setCopyrights(DEFAULT_COPYRIGHTS)}>添加版权</button>
            <button onClick={() => setAnchor(BMAP_ANCHOR_BOTTOM_LEFT)}>左下角</button>
          </div>
        </section>
        <PropsView value={controlProps} />
      </>
    )}>
      <CopyrightControl
        visible={visible}
        anchor={anchor}
        offset={offset}
        copyrights={copyrights}
      />
    </ControlPageLayout>
  );
}
