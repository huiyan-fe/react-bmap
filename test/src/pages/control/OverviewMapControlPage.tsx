import { useState } from 'react';
import {
  BMAP_ANCHOR_BOTTOM_RIGHT,
  OverviewMapControl,
} from 'react-bmap';
import type { ControlAnchor, OverviewMapControlProps } from 'react-bmap';
import { AnchorSelect, BooleanRow, ControlPageLayout, DEFAULT_CONTROL_OFFSET, EventLog, formatEventValue, logEvent, PropsView, SizeInputs, VisibilityControl } from './shared';

export function OverviewMapControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_BOTTOM_RIGHT);
  const [offset, setOffset] = useState<OverviewMapControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [size, setSize] = useState<OverviewMapControlProps['size']>({ width: 150, height: 150 });
  const [isOpen, setIsOpen] = useState(true);
  const [zoomInterval, setZoomInterval] = useState(4);
  const [padding, setPadding] = useState(4);
  const [logs, setLogs] = useState<string[]>([]);

  const controlProps: OverviewMapControlProps = {
    visible,
    anchor,
    offset,
    size,
    isOpen,
    zoomInterval,
    padding,
  };

  return (
    <ControlPageLayout title="OverviewMapControl" capability="OverviewMapControl" controls={(
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
          <h3>size</h3>
          <SizeInputs value={size} onChange={setSize} />
        </section>
        <section>
          <h3>isOpen</h3>
          <BooleanRow label="isOpen" checked={isOpen} onChange={setIsOpen} />
        </section>
        <section>
          <h3>zoomInterval（重建）</h3>
          <input type="number" className="full-width" value={zoomInterval} onChange={e => setZoomInterval(Number(e.target.value))} />
        </section>
        <section>
          <h3>padding（重建）</h3>
          <input type="number" className="full-width" value={padding} onChange={e => setPadding(Number(e.target.value))} />
        </section>
        <EventLog logs={logs} />
        <PropsView value={controlProps} />
      </>
    )}>
      <OverviewMapControl
        visible={visible}
        anchor={anchor}
        offset={offset}
        size={size}
        isOpen={isOpen}
        zoomInterval={zoomInterval}
        padding={padding}
        onViewChanged={(raw) => logEvent(setLogs, `viewchanged ${formatEventValue(raw)}`)}
        onViewChanging={(raw) => logEvent(setLogs, `viewchanging ${formatEventValue(raw)}`)}
        onResize={(raw) => logEvent(setLogs, `resize ${formatEventValue(raw)}`)}
      />
    </ControlPageLayout>
  );
}
