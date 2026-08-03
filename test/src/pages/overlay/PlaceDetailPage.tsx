/**
 * PlaceDetail（Overlay）测试页 — 覆盖 v4+ 地点详情组件。
 * 需要嵌套在 <Marker> 内，通过 open 控制 openPlaceDetail / closePlaceDetail。
 * v3 下不渲染组件，避免误触发 unsupported 行为。
 */
import React, { useMemo, useState } from 'react';
import { Map, Marker, PlaceDetail, useCapabilities } from 'react-bmap';
import type { Point, PlaceDetailOptions, PlaceDetailRenderOptions } from 'react-bmap';
import { BEIJING } from '../../TestProvider';

const DEFAULT_POINT: Point = { lng: 116.404, lat: 39.915 };
const DEFAULT_UID = '06d2dffda107b0ef89f15db6';

export function PlaceDetailPage() {
  const caps = useCapabilities();
  const supported = caps.has('Map.setHeading');

  const [position, setPosition] = useState<Point>(DEFAULT_POINT);
  const [uid, setUid] = useState(DEFAULT_UID);
  const [open, setOpen] = useState(true);

  const [displayCarousel, setDisplayCarousel] = useState(true);
  const [displayTag, setDisplayTag] = useState(true);
  const [displayRating, setDisplayRating] = useState(true);
  const [displayPrice, setDisplayPrice] = useState(true);
  const [displayBangdan, setDisplayBangdan] = useState(false);
  const [displayTradeTag, setDisplayTradeTag] = useState(false);
  const [displayShopHours, setDisplayShopHours] = useState(true);
  const [displayContactInformation, setDisplayContactInformation] = useState(true);
  const [contactInformationCount, setContactInformationCount] = useState<number | undefined>(2);
  const [displayAddress, setDisplayAddress] = useState(true);
  const [displayComment, setDisplayComment] = useState(true);
  const [displayCommentTotalCount, setDisplayCommentTotalCount] = useState(true);

  const renderOptions = useMemo<PlaceDetailRenderOptions>(() => ({
    displayCarousel,
    displayTag,
    displayRating,
    displayPrice,
    displayBangdan,
    displayTradeTag,
    displayShopHours,
    displayContactInformation,
    contactInformationCount,
    displayAddress,
    displayComment,
    displayCommentTotalCount,
  }), [
    displayCarousel,
    displayTag,
    displayRating,
    displayPrice,
    displayBangdan,
    displayTradeTag,
    displayShopHours,
    displayContactInformation,
    contactInformationCount,
    displayAddress,
    displayComment,
    displayCommentTotalCount,
  ]);

  const options = useMemo<PlaceDetailOptions>(() => ({
    renderOptions,
  }), [renderOptions]);

  return (
    <div className="test-page">
      <div className="test-map">
        <Map defaultCenter={BEIJING} defaultZoom={14} style={{ height: '100%' }}>
          <Marker position={position} title="PlaceDetail anchor">
            {supported && (
              <PlaceDetail uid={uid} open={open} options={options} />
            )}
          </Marker>
        </Map>
      </div>

      <div className="test-controls">
        <h2>PlaceDetail（Overlay）</h2>

        <section>
          <h3>能力</h3>
          <div className={`cap-tag ${supported ? 'ok' : 'no'}`}>
            {supported ? 'v4+' : 'v3 ✗'}
          </div>
          <p className="muted small">
            PlaceDetail 仅 v4+ 可用，必须挂在 Marker 内通过 open 控制显示。
          </p>
        </section>

        <section>
          <h3>position（Marker 锚点）</h3>
          <div className="input-row">
            <label>lng</label>
            <input
              type="number"
              step={0.001}
              value={position.lng}
              onChange={e => setPosition(p => ({ ...p, lng: Number(e.target.value) }))}
            />
            <label>lat</label>
            <input
              type="number"
              step={0.001}
              value={position.lat}
              onChange={e => setPosition(p => ({ ...p, lat: Number(e.target.value) }))}
            />
          </div>
        </section>

        <section>
          <h3>uid</h3>
          <input
            type="text"
            className="full-width"
            value={uid}
            onChange={e => setUid(e.target.value)}
          />
          <p className="muted small">地点唯一标识，变更后会重新请求地点详情。</p>
        </section>

        <section>
          <h3>open</h3>
          <div className="btn-group">
            <button className={open ? 'active' : ''} onClick={() => setOpen(true)}>打开</button>
            <button className={!open ? 'active' : ''} onClick={() => setOpen(false)}>关闭</button>
          </div>
        </section>

        <section>
          <h3>renderOptions</h3>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayCarousel}
              onChange={e => setDisplayCarousel(e.target.checked)}
            />
            displayCarousel
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayTag}
              onChange={e => setDisplayTag(e.target.checked)}
            />
            displayTag
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayRating}
              onChange={e => setDisplayRating(e.target.checked)}
            />
            displayRating
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayPrice}
              onChange={e => setDisplayPrice(e.target.checked)}
            />
            displayPrice
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayBangdan}
              onChange={e => setDisplayBangdan(e.target.checked)}
            />
            displayBangdan
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayTradeTag}
              onChange={e => setDisplayTradeTag(e.target.checked)}
            />
            displayTradeTag
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayShopHours}
              onChange={e => setDisplayShopHours(e.target.checked)}
            />
            displayShopHours
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayContactInformation}
              onChange={e => setDisplayContactInformation(e.target.checked)}
            />
            displayContactInformation
          </label>
          <label className="checkbox-row">
            contactInformationCount
            <input
              type="number"
              placeholder="未设置"
              value={contactInformationCount ?? ''}
              onChange={e => setContactInformationCount(e.target.value === '' ? undefined : Number(e.target.value))}
            />
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayAddress}
              onChange={e => setDisplayAddress(e.target.checked)}
            />
            displayAddress
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayComment}
              onChange={e => setDisplayComment(e.target.checked)}
            />
            displayComment
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={displayCommentTotalCount}
              onChange={e => setDisplayCommentTotalCount(e.target.checked)}
            />
            displayCommentTotalCount
          </label>
        </section>

        <section>
          <h3>动作</h3>
          <div className="btn-group" style={{ flexWrap: 'wrap' }}>
            <button
              style={{ fontSize: 11 }}
              onClick={() => {
                setPosition(DEFAULT_POINT);
                setUid(DEFAULT_UID);
                setOpen(true);
                setDisplayCarousel(true);
                setDisplayTag(true);
                setDisplayRating(true);
                setDisplayPrice(true);
                setDisplayBangdan(false);
                setDisplayTradeTag(false);
                setDisplayShopHours(true);
                setDisplayContactInformation(true);
                setContactInformationCount(2);
                setDisplayAddress(true);
                setDisplayComment(true);
                setDisplayCommentTotalCount(true);
              }}
            >
              reset all
            </button>
            <button
              style={{ fontSize: 11 }}
              onClick={() => {
                setDisplayCarousel(false);
                setDisplayBangdan(true);
                setDisplayTradeTag(true);
              }}
            >
              精简预设
            </button>
            <button
              style={{ fontSize: 11 }}
              onClick={() => {
                setPosition({ lng: 116.397, lat: 39.908 });
                setUid(DEFAULT_UID);
                setOpen(true);
              }}
            >
              天安门预设
            </button>
          </div>
        </section>

        <section>
          <h3>当前配置</h3>
          <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto' }}>
            {JSON.stringify({ uid, open, options, position }, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
