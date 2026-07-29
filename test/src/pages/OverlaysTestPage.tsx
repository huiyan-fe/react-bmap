import React, { useState } from 'react';
import { Map, Marker, Label, Polyline, Polygon, Circle, Rectangle, Prism, PointCollection, InfoWindow, GroundOverlay, BezierCurve, GroundPoint, useCapabilities } from 'react-bmap';
import type { Point } from 'react-bmap';
import { BEIJING } from '../TestProvider';

const P1 = BEIJING;
const P2: Point = { lng: 116.42, lat: 39.92 };
const P3: Point = { lng: 116.41, lat: 39.90 };
const PATH: Point[] = [P1, P2, P3];
/** BezierCurve 控制点：组数必须 = PATH.length - 1，每组 1~2 个点 */
const CURVE_CPS: Point[][] = [
  [{ lng: 116.412, lat: 39.925 }],
  [{ lng: 116.424, lat: 39.910 }],
];
const RECT_BOUNDS = { sw: { lng: 116.38, lat: 39.88 }, ne: { lng: 116.43, lat: 39.93 } };

export function OverlaysTestPage() {
  const caps = useCapabilities();
  const [show, setShow] = useState<Record<string, boolean>>({ marker: true });

  const toggle = (k: string) => setShow(s => ({ ...s, [k]: !s[k] }));
  const allOff = () => setShow({});
  const allOn = () => setShow({ marker: true, label: true, polyline: true, polygon: true, circle: true, rectangle: true, prism: true, pointCollection: true, groundOverlay: true, bezierCurve: true });

  const capTag = (cap: string) => caps.has(cap)
    ? <span className="cap-tag ok">✓</span>
    : <span className="cap-tag no">✗</span>;

  const overlays: Array<[string, string, React.ReactNode]> = [
    ['marker', `Marker ${capTag('Marker')}`, show.marker && <Marker position={P1} title="天安门" rotation={30} enableDragging />],
    ['label', `Label ${capTag('Label')}`, show.label && <Label content="标签文字" position={P2} />],
    ['polyline', `Polyline ${capTag('Polyline')}`, show.polyline && <Polyline path={PATH} strokeColor="#f00" strokeWeight={4} strokeOpacity={0.8} />],
    ['polygon', `Polygon ${capTag('Polygon')}`, show.polygon && <Polygon path={PATH} strokeColor="#00f" fillColor="#00f5" strokeWeight={3} fillOpacity={0.3} />],
    ['circle', `Circle ${capTag('Circle')}`, show.circle && <Circle center={P1} radius={500} strokeColor="#0a0" fillColor="#0a05" strokeWeight={2} />],
    ['rectangle', `Rectangle ${capTag('Rectangle')}`, show.rectangle && <Rectangle bounds={RECT_BOUNDS} strokeColor="#f80" fillColor="#f805" strokeWeight={2} />],
    ['prism', `Prism (v4+) ${capTag('Prism')}`, show.prism && <Prism path={PATH} topFillColor="#1890ff" sideFillColor="#1890ff55" />],
    ['pointCollection', `PointCollection ${capTag('PointCollection')}`, show.pointCollection && <PointCollection points={Array.from({ length: 20 }, (_, i) => ({ lng: 116.40 + i * 0.001, lat: 39.91 + i * 0.001 }))} color="#ff0000" size={1} />],
    ['groundOverlay', `GroundOverlay ${capTag('GroundOverlay')}`, show.groundOverlay && <GroundOverlay bounds={RECT_BOUNDS} imageURL="https://lbsyun.baidu.com/jsdemo/demo/images/logo.png" opacity={0.8} />],
    ['bezierCurve', `BezierCurve (v4+) ${capTag('BezierCurve')}`, show.bezierCurve && <BezierCurve path={PATH} controlPoints={CURVE_CPS} strokeColor="#a0f" strokeWeight={3} />],
  ];

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={13} style={{ height: '100%' }}>
          {overlays.filter(([, , node]) => node).map(([, , node]) => node)}
        </Map>
      </div>
      <div className="test-controls">
        <h2>Overlays（16 种）</h2>
        <div className="btn-group">
          <button onClick={allOn}>全部显示</button>
          <button onClick={allOff}>全部隐藏</button>
        </div>
        <section>
          <h3>覆盖物开关</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {overlays.map(([key, label]) => (
              <label key={key} className="checkbox-row" style={{ minWidth: 180 }}>
                <input type="checkbox" checked={!!show[key]} onChange={() => toggle(key)} />
                <span dangerouslySetInnerHTML={{ __html: label.replace(/<span/g, '<span') }} />
              </label>
            ))}
          </div>
        </section>
        <p className="muted small">
          未实现的组件：GroundPoint、Symbol、Icon、IconSequence、Hotspot、CustomOverlay、InfoWindow。
          每个覆盖物在地图上展示对应效果；v3 上 Prism/BezierCurve/Rectangle 不支持（红 ✗）。
        </p>
      </div>
    </div>
  );
}
