import { useState } from 'react';
import {
  BMAP_ANCHOR_BOTTOM_LEFT,
  LogoControl,
} from 'react-bmap';
import type { ControlAnchor, LogoControlProps } from 'react-bmap';
import { AnchorSelect, ControlPageLayout, PropsView, SizeInputs, VisibilityControl } from './shared';

export function LogoControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_BOTTOM_LEFT);
  const [offset, setOffset] = useState<LogoControlProps['offset']>({ width: 5, height: 15 });

  const controlProps: LogoControlProps = { visible, anchor, offset };

  return (
    <ControlPageLayout title="LogoControl" capability="LogoControl" versionNote="v4+ 控件，v3 不支持。" controls={(
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
      <LogoControl visible={visible} anchor={anchor} offset={offset} />
    </ControlPageLayout>
  );
}
