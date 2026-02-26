/**
 * Factory for BMap/BMapGL custom Overlay
 * Creates a custom overlay class that extends BMap.Overlay
 */
export function createCustomOverlay(B: any) {
  function CustomOverlay(
    this: any,
    point: any,
    content: HTMLElement | string,
    options?: { zIndex?: number; pane?: string; offset?: any }
  ) {
    this.options = options || {};
    this._point = point;
    this.content = content;
  }

  CustomOverlay.prototype = Object.create(B.Overlay.prototype);

  CustomOverlay.prototype.initialize = function (map: any) {
    this._map = map;
    const div = (this._div = document.createElement('div'));
    div.setAttribute('tag', 'customoverlay');
    div.style.position = 'absolute';
    const zIndex = this.options.zIndex || B.Overlay.getZIndex(this._point.lat);
    div.style.zIndex = zIndex;
    div.addEventListener('touchstart', (e: Event) => e.stopPropagation());
    div.addEventListener('touchend', (e: Event) => e.stopPropagation());
    if (Object.prototype.toString.call(this.content) === '[object String]') {
      div.innerHTML = this.content as string;
    } else {
      div.appendChild(this.content as HTMLElement);
    }
    const pane = this.options.pane || 'labelPane';
    map.getPanes()[pane].appendChild(div);
    return div;
  };

  CustomOverlay.prototype.draw = function () {
    const map = this._map;
    const pixel = map.pointToOverlayPixel(this._point);
    const offset = this.options.offset || new B.Size(0, 0);
    this._div.style.left = pixel.x + offset.width + 'px';
    this._div.style.top = pixel.y + offset.height + 'px';
  };

  return CustomOverlay;
}
