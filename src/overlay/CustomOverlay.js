// 自定义覆盖物
function CustomOverlay(point, content, offset) {
    this._point = point;
    this.content = content;
    this.offset = offset || new BMap.Size(0, 0);
}

CustomOverlay.prototype = new BMap.Overlay();

CustomOverlay.prototype.initialize = function(map){
    this._map = map;
    var div = this._div = document.createElement("div");
    div.style.position = "absolute";
    div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
    if (Object.prototype.toString.call(this.content) == "[object String]") {
        div.innerHTML = this.content;
    } else {
        div.appendChild(this.content);
    }
    map.getPanes().labelPane.appendChild(div);
    return div;
}

CustomOverlay.prototype.draw = function(){
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x + this.offset.width + "px";
    this._div.style.top  = pixel.y + this.offset.height + "px";
}

export default CustomOverlay;
