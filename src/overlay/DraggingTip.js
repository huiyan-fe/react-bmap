import Tip from './Tip.js';

function DraggingTip(options) {
    this.options = options;
    var map = options.map;
    var point = options.point;
    this.point = point;
    var name = options.name;

    this.map = map;
    var tip = this.tip = new Tip(options);
    var icon = new BMap.Icon("http://huiyan.baidu.com/github/tools/gis-drawing/static/images/drag.png", new BMap.Size(25, 25), {
        imageSize: new BMap.Size(25, 25)
    });
    var marker = this.marker = new BMap.Marker(this.point);
    marker.setIcon(icon);
    marker.setShadow(icon);
    var self = this;
    marker.addEventListener('dragging', function () {
        self.point = marker.point;
        tip.setPosition(marker.point)
        options.change && options.change();
    });
    marker.addEventListener('dragend', function () {
        options.changePosition && options.changePosition(self.point);
    });
    marker.enableDragging();
}

DraggingTip.prototype.show = function () {
    this.map.addOverlay(this.marker);
    this.map.addOverlay(this.tip);
    if (this.options.isShowTipArrow === false) {
        this.tip.hideArrow();
    }
}

DraggingTip.prototype.hide = function () {
    this.map.removeOverlay(this.marker);
    this.map.removeOverlay(this.tip);
}

DraggingTip.prototype.setNumberLeft = function () {
    this.tip.setNumberLeft();
}

DraggingTip.prototype.setNumberRight = function () {
    this.tip.setNumberRight();
}

DraggingTip.prototype.hideNumber = function () {
    this.tip.hideNumber();
}

export default DraggingTip;
