import { useState } from 'react';
import {
  BMAP_ANCHOR_TOP_RIGHT,
  BMAP_MAPTYPE_CONTROL_DROPDOWN,
  BMAP_MAPTYPE_CONTROL_HORIZONTAL,
  BMAP_MAPTYPE_CONTROL_MAP,
  MapTypeControl,
} from 'react-bmap';
import type { ControlAnchor, MapTypeControlProps } from 'react-bmap';
import { AnchorSelect, BooleanRow, ControlPageLayout, DEFAULT_CONTROL_OFFSET, PropsView, SizeInputs, VisibilityControl } from './shared';

export function MapTypeControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_TOP_RIGHT);
  const [offset, setOffset] = useState<MapTypeControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [type, setType] = useState<MapTypeControlProps['type']>(BMAP_MAPTYPE_CONTROL_MAP);
  const [enableSwitch, setEnableSwitch] = useState(true);
  const [showStreetLayer, setShowStreetLayer] = useState(false);

  const controlProps: MapTypeControlProps = {
    visible,
    anchor,
    offset,
    type,
    enableSwitch,
    showStreetLayer,
  };

  return (
    <ControlPageLayout title="MapTypeControl" capability="MapTypeControl" controls={(
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
          <h3>type（重建）</h3>
          <select value={type ?? ''} onChange={e => setType(e.target.value === '' ? undefined : Number(e.target.value) as MapTypeControlProps['type'])}>
            <option value="">默认</option>
            <option value={BMAP_MAPTYPE_CONTROL_HORIZONTAL}>HORIZONTAL</option>
            <option value={BMAP_MAPTYPE_CONTROL_DROPDOWN}>DROPDOWN</option>
            <option value={BMAP_MAPTYPE_CONTROL_MAP}>MAP</option>
          </select>
        </section>
        <section>
          <h3>enableSwitch（重建）</h3>
          <BooleanRow label="enableSwitch" checked={enableSwitch} onChange={setEnableSwitch} />
        </section>
        <section>
          <h3>showStreetLayer</h3>
          <BooleanRow label="showStreetLayer" checked={showStreetLayer} onChange={setShowStreetLayer} />
        </section>
        <PropsView value={controlProps} />
      </>
    )}>
      <MapTypeControl
        visible={visible}
        anchor={anchor}
        offset={offset}
        type={type}
        enableSwitch={enableSwitch}
        showStreetLayer={showStreetLayer}
      />
    </ControlPageLayout>
  );
}
