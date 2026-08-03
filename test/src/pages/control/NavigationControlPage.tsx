import { useState } from 'react';
import {
  BMAP_ANCHOR_TOP_LEFT,
  BMAP_ANCHOR_TOP_RIGHT,
  BMAP_NAVIGATION_CONTROL_LARGE,
  BMAP_NAVIGATION_CONTROL_PAN,
  BMAP_NAVIGATION_CONTROL_SMALL,
  BMAP_NAVIGATION_CONTROL_ZOOM,
  NavigationControl,
} from 'react-bmap';
import type { ControlAnchor, NavigationControlProps } from 'react-bmap';
import { AnchorSelect, BooleanRow, ControlPageLayout, DEFAULT_CONTROL_OFFSET, PropsView, SizeInputs, VisibilityControl } from './shared';

export function NavigationControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_TOP_LEFT);
  const [offset, setOffset] = useState<NavigationControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [type, setType] = useState<NavigationControlProps['type']>(BMAP_NAVIGATION_CONTROL_LARGE);
  const [showZoomInfo, setShowZoomInfo] = useState(true);
  const [enableGeolocation, setEnableGeolocation] = useState(false);

  const controlProps: NavigationControlProps = {
    visible,
    anchor,
    offset,
    type,
    showZoomInfo,
    enableGeolocation,
  };

  return (
    <ControlPageLayout title="NavigationControl" capability="NavigationControl" controls={(
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
          <h3>type</h3>
          <select value={type ?? ''} onChange={e => setType(e.target.value === '' ? undefined : Number(e.target.value) as NavigationControlProps['type'])}>
            <option value="">默认</option>
            <option value={BMAP_NAVIGATION_CONTROL_LARGE}>LARGE</option>
            <option value={BMAP_NAVIGATION_CONTROL_SMALL}>SMALL</option>
            <option value={BMAP_NAVIGATION_CONTROL_PAN}>PAN</option>
            <option value={BMAP_NAVIGATION_CONTROL_ZOOM}>ZOOM</option>
          </select>
        </section>
        <section>
          <h3>showZoomInfo（重建）</h3>
          <BooleanRow label="showZoomInfo" checked={showZoomInfo} onChange={setShowZoomInfo} />
        </section>
        <section>
          <h3>enableGeolocation（重建）</h3>
          <BooleanRow label="enableGeolocation" checked={enableGeolocation} onChange={setEnableGeolocation} />
        </section>
        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button onClick={() => setType(BMAP_NAVIGATION_CONTROL_SMALL)}>小型缩放</button>
            <button onClick={() => { setAnchor(BMAP_ANCHOR_TOP_RIGHT); setEnableGeolocation(true); }}>右上定位</button>
          </div>
        </section>
        <PropsView value={controlProps} />
      </>
    )}>
      <NavigationControl
        visible={visible}
        anchor={anchor}
        offset={offset}
        type={type}
        showZoomInfo={showZoomInfo}
        enableGeolocation={enableGeolocation}
      />
    </ControlPageLayout>
  );
}
