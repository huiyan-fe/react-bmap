/**
 * Dragging tip overlay - combines Tip overlay with draggable marker
 */
import { createTipOverlay } from './createTipOverlay';

const DRAG_ICON_URL =
  '//huiyan.baidu.com/github/tools/gis-drawing/static/images/drag.png';

export function createDraggingTipOverlay(B: any) {
  const Tip = createTipOverlay(B);

  function DraggingTip(this: any, options: any) {
    this.options = options;
    const map = options.map;
    const point = options.point;
    this.point = point;
    const draggable = options.draggable !== false;
    this.map = map;
    const tip = (this.tip = new (Tip as any)(options));
    const icon = new B.Icon(DRAG_ICON_URL, new B.Size(25, 25), {
      imageSize: new B.Size(25, 25),
    });
    const marker = (this.marker = new B.Marker(point));
    marker.setIcon(icon);
    marker.setShadow(icon);
    const self = this;
    if (draggable) {
      marker.addEventListener('dragging', () => {
        const pos = (marker as any).getPosition?.() || (marker as any).point;
        self.point = pos;
        tip.setPosition(pos);
        options.change?.();
      });
      marker.addEventListener('dragend', () => {
        const pos = (marker as any).getPosition?.() || self.point;
        options.changePosition?.(pos);
      });
      marker.enableDragging();
    }
  }

  DraggingTip.prototype.show = function () {
    this.map.addOverlay(this.marker);
    this.map.addOverlay(this.tip);
    if (this.options.isShowTipArrow === false) {
      this.tip.hideArrow();
    }
  };

  DraggingTip.prototype.hide = function () {
    this.map.removeOverlay(this.marker);
    this.map.removeOverlay(this.tip);
  };

  DraggingTip.prototype.setNumberLeft = function () {
    this.tip.setNumberLeft();
  };

  DraggingTip.prototype.setNumberRight = function () {
    this.tip.setNumberRight();
  };

  DraggingTip.prototype.hideNumber = function () {
    this.tip.hideNumber();
  };

  return DraggingTip;
}
