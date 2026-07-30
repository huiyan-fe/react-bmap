/**
 * CustomOverlay — React children based custom DOM overlay.
 *
 * SDK still requires a domCreate function, but the public React API renders children
 * into the DOM element through a portal.
 */
import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMapContext } from '../../context/MapContext';
import { useOverlayTarget } from '../../context/OverlayTargetContext';
import { stableStringify } from '../../utils/stableStringify';
import type { OverlayHandle } from '../../types';
import type { CustomOverlayProps } from './types';

const OPTION_PROPS: Array<keyof CustomOverlayProps & string> = [
  'point', 'rotation', 'rotationInit', 'properties', 'enableMassClear', 'zIndex',
];

const CTOR_ONLY_PROPS: Array<keyof CustomOverlayProps & string> = [
  'anchors', 'offsetX', 'offsetY', 'minZoom', 'maxZoom', 'fixBottom',
  'useTranslate', 'autoFollowHeadingChanged', 'enableDraggingMap',
];

const EVENTS: Array<{ sdk: string; prop: keyof CustomOverlayProps & string }> = [
  { sdk: 'click', prop: 'onClick' },
  { sdk: 'mouseover', prop: 'onMouseOver' },
  { sdk: 'mouseout', prop: 'onMouseOut' },
];

function pickDefined(
  props: CustomOverlayProps,
  keys: Array<keyof CustomOverlayProps & string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = props[key];
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

function pickSdkProps(props: CustomOverlayProps): Record<string, unknown> {
  const {
    children: _children,
    visible: _visible,
    onClick: _onClick,
    onMouseOver: _onMouseOver,
    onMouseOut: _onMouseOut,
    ...sdkProps
  } = props;
  void _children; void _visible; void _onClick; void _onMouseOver; void _onMouseOut;

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sdkProps)) {
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

export const CustomOverlay = memo(function CustomOverlay(props: CustomOverlayProps) {
  const { map, driver } = useMapContext();
  const target = useOverlayTarget();
  const overlayRef = useRef<OverlayHandle | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  if (!containerRef.current && typeof document !== 'undefined') {
    containerRef.current = document.createElement('div');
  }

  const ctorKey = stableStringify(CTOR_ONLY_PROPS.map(k => props[k]));

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!map || !driver || !container) return;

    const sdkProps = pickSdkProps(propsRef.current);
    const overlay = driver.createCustomOverlay(() => container, sdkProps);
    if (!overlay) return;

    overlayRef.current = overlay;
    if (target?.addOverlay) target.addOverlay(overlay);
    else driver.addOverlay(map, overlay);

    const initOpts = pickDefined(propsRef.current, OPTION_PROPS);
    if (Object.keys(initOpts).length > 0) {
      driver.setOverlayOptions(overlay, initOpts);
    }
    if (propsRef.current.visible === false) {
      driver.hideOverlay(overlay);
    }

    return () => {
      if (target?.removeOverlay) target.removeOverlay(overlay);
      else driver.removeOverlay(map, overlay);
      overlayRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, driver, target, ctorKey]);

  const optionSnapshot = pickDefined(props, OPTION_PROPS);
  const optionKey = stableStringify(optionSnapshot);
  useEffect(() => {
    if (!overlayRef.current || !driver) return;
    if (Object.keys(optionSnapshot).length > 0) {
      driver.setOverlayOptions(overlayRef.current, optionSnapshot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, optionKey]);

  const { visible } = props;
  useEffect(() => {
    if (!overlayRef.current || !driver) return;
    if (visible === false) driver.hideOverlay(overlayRef.current);
    else driver.showOverlay(overlayRef.current);
  }, [driver, visible]);

  const eventKey = stableStringify(EVENTS.map(e => `${e.sdk}:${typeof props[e.prop]}`));
  const handlersRef = useRef<Record<string, unknown>>({});
  for (const { prop } of EVENTS) {
    handlersRef.current[prop] = props[prop];
  }

  useEffect(() => {
    if (!overlayRef.current || !driver) return;
    const unsubs: Array<() => void> = [];
    for (const { sdk, prop } of EVENTS) {
      unsubs.push(driver.addEventListener(overlayRef.current, sdk, (raw: unknown) => {
        const fn = handlersRef.current[prop];
        if (typeof fn === 'function') {
          const event = raw as Record<string, unknown>;
          fn(event?.point ?? event?.latLng ?? raw, raw);
        }
      }));
    }
    return () => unsubs.forEach(unsub => unsub());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driver, eventKey, ctorKey]);

  const container = containerRef.current;
  return container ? createPortal(props.children, container) : null;
});
