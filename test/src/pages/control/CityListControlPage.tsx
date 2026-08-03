import { useState } from 'react';
import {
  BMAP_ANCHOR_TOP_LEFT,
  CityListControl,
} from 'react-bmap';
import type { CityListControlProps, ControlAnchor } from 'react-bmap';
import { AnchorSelect, BooleanRow, ControlPageLayout, DEFAULT_CONTROL_OFFSET, EventLog, formatEventValue, logEvent, PropsView, SizeInputs, VisibilityControl } from './shared';

export function CityListControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_TOP_LEFT);
  const [offset, setOffset] = useState<CityListControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [expand, setExpand] = useState(false);
  const [canCheckSize, setCanCheckSize] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const controlProps: CityListControlProps = {
    visible,
    anchor,
    offset,
    expand,
    canCheckSize,
  };

  return (
    <ControlPageLayout title="CityListControl" capability="CityListControl" versionNote="v4+ 控件，v3 不支持。" controls={(
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
          <h3>构造选项</h3>
          <BooleanRow label="expand" checked={expand} onChange={setExpand} />
          <BooleanRow label="canCheckSize" checked={canCheckSize} onChange={setCanCheckSize} />
        </section>
        <EventLog logs={logs} />
        <PropsView value={controlProps} />
      </>
    )}>
      <CityListControl
        visible={visible}
        anchor={anchor}
        offset={offset}
        expand={expand}
        canCheckSize={canCheckSize}
        onChangeBefore={() => logEvent(setLogs, 'changeBefore')}
        onChangeAfter={() => logEvent(setLogs, 'changeAfter')}
        onChangeSuccess={(poi) => logEvent(setLogs, `changeSuccess ${formatEventValue(poi)}`)}
        onOpen={() => logEvent(setLogs, 'open')}
        onClose={() => logEvent(setLogs, 'close')}
      />
    </ControlPageLayout>
  );
}
