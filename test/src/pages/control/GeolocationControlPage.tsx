import { useState } from 'react';
import {
  BMAP_ANCHOR_BOTTOM_LEFT,
  GeolocationControl,
} from 'react-bmap';
import type { ControlAnchor, GeolocationControlProps } from 'react-bmap';
import { AnchorSelect, BooleanRow, ControlPageLayout, DEFAULT_CONTROL_OFFSET, EventLog, formatEventValue, logEvent, PropsView, SizeInputs, VisibilityControl } from './shared';

export function GeolocationControlPage() {
  const [visible, setVisible] = useState(true);
  const [anchor, setAnchor] = useState<ControlAnchor | undefined>(BMAP_ANCHOR_BOTTOM_LEFT);
  const [offset, setOffset] = useState<GeolocationControlProps['offset']>(DEFAULT_CONTROL_OFFSET);
  const [showAddressBar, setShowAddressBar] = useState(true);
  const [enableAutoLocation, setEnableAutoLocation] = useState(false);
  const [watchPosition, setWatchPosition] = useState(false);
  const [useCompass, setUseCompass] = useState(false);
  const [autoZoom, setAutoZoom] = useState(true);
  const [autoViewport, setAutoViewport] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  const controlProps: GeolocationControlProps = {
    visible,
    anchor,
    offset,
    showAddressBar,
    enableAutoLocation,
    watchPosition,
    useCompass,
    autoZoom,
    autoViewport,
  };

  return (
    <ControlPageLayout title="GeolocationControl / LocationControl" capability="GeolocationControl" versionNote="LocationControl 是 GeolocationControl 的兼容别名。" controls={(
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
          <h3>定位选项</h3>
          <BooleanRow label="showAddressBar" checked={showAddressBar} onChange={setShowAddressBar} />
          <BooleanRow label="enableAutoLocation" checked={enableAutoLocation} onChange={setEnableAutoLocation} />
          <BooleanRow label="watchPosition" checked={watchPosition} onChange={setWatchPosition} />
          <BooleanRow label="useCompass" checked={useCompass} onChange={setUseCompass} />
          <BooleanRow label="autoZoom" checked={autoZoom} onChange={setAutoZoom} />
          <BooleanRow label="autoViewport" checked={autoViewport} onChange={setAutoViewport} />
        </section>
        <EventLog logs={logs} />
        <PropsView value={controlProps} />
      </>
    )}>
      <GeolocationControl
        visible={visible}
        anchor={anchor}
        offset={offset}
        showAddressBar={showAddressBar}
        enableAutoLocation={enableAutoLocation}
        watchPosition={watchPosition}
        useCompass={useCompass}
        autoZoom={autoZoom}
        autoViewport={autoViewport}
        onLocationSuccess={(raw) => logEvent(setLogs, `locationSuccess ${formatEventValue(raw)}`)}
        onLocationError={(raw) => logEvent(setLogs, `locationError ${formatEventValue(raw)}`)}
      />
    </ControlPageLayout>
  );
}
