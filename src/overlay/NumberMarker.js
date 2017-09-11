function Overlay(options){
    this.options = options || {};
    this._point = options.point;
    this._fillColor = options.fillStyle || '#1495ff';
    this._size = options.size || 30;
    this._lineWidth = options.lineWidth === undefined ? 2 : options.lineWidth;
    this._strokeStyle = options.strokeStyle || '#ffffff';
    if (options.strokeOpacity) {
        this._strokeStyle = colorRgb(this._strokeStyle, 0.4)
    }
}

Overlay.prototype = new BMap.Overlay();

Overlay.prototype.initialize = function(map){
    this._map = map;
    var div = this._div = document.createElement("div");
    var style = div.style;
    style.position = "absolute";
    style.backgroundClip = 'padding-box';
    style.zIndex = this.options.zIndex || BMap.Overlay.getZIndex(this._point.lat);
    style.backgroundColor = this._fillColor;
    if (this.options.isShowShadow !== false) {
        style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';
    }
    style.border = this._lineWidth + "px solid " + this._strokeStyle;
    style.color = "white";
    style.textShadow = "0px 0px 5px #fff";
    style.width = this._size + "px";
    style.boxSizing = "content-box";
    style.borderRadius = "30px";
    style.height = this._size + "px";
    style.lineHeight = this._size + "px";
    style.fontSize = "12px";
    style.cursor = "pointer";
    style.textAlign = "center";
    style.MozUserSelect = "none";
    if (this.options.number && this.options.isShowNumber !== false) {
        div.innerHTML = this.options.number;
    }

    var self = this;
    div.addEventListener('mouseover', function () {
        self.dispatchEvent('mouseover', self.options.number);
        style.backgroundColor = '#1495ff';
    });

    div.addEventListener('mouseout', function () {
        self.dispatchEvent('mouseout', self.options.number);
        style.backgroundColor = self._fillColor;
    });

    div.addEventListener('click', function () {
        self.dispatchEvent('click', self.options.number);
    });

    map.getPanes().markerPane.appendChild(div);

    return div;
}

Overlay.prototype.draw = function(){
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x - (this._size + this._lineWidth) / 2 + 1 + "px";
    this._div.style.top  = pixel.y - (this._size + this._lineWidth) / 2 + "px";
}

  
/*16进制颜色转为RGB格式*/  
function colorRgb(color, opacity) {
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;  
    var sColor = color.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            var sColorNew = "#";
            for(var i = 1; i < 4; i += 1){
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }
        //处理六位的颜色值  
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2){
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        if (opacity) {
            sColorChange.push(opacity);
            return "rgba(" + sColorChange.join(",") + ")";
        } else {
            return "rgb(" + sColorChange.join(",") + ")";
        }
    } else {
        return sColor;
    }
};

export default Overlay;
