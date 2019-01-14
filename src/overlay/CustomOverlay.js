// 自定义覆盖物
function CustomOverlay(point, content, options) {
    this.options = options || {};
    this._point = point;
    this.content = content;
}

CustomOverlay.prototype = new BMap.Overlay();

CustomOverlay.prototype.initialize = function(map){
    this._map = map;
    var div = this._div = document.createElement("div");
    div.setAttribute('tag', 'customoverlay');
    div.style.position = "absolute";
    var zIndex = this.options.zIndex || BMap.Overlay.getZIndex(this._point.lat);
    div.style.zIndex = zIndex;
    div.addEventListener('touchstart', function (e) {
        e.stopPropagation();
        console.log('touchstart');
    });
    /*
    div.addEventListener('touchmove', function (e) {
        e.stopPropagation();
        console.log('touchmove');
    });
    */
    div.addEventListener('touchend', function (e) {
        e.stopPropagation();
        console.log('touchend');
    });
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
    var offset = this.options.offset || new BMap.Size(0, 0);
    this._div.style.left = pixel.x + offset.width + "px";
    this._div.style.top  = pixel.y + offset.height + "px";
}

export default CustomOverlay;
