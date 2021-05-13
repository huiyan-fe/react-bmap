var positions = {
    '#ee5d5b': '0 0',
    '#ff9625': '0 -10px',
    '#6caeca': '0 -20px'
}
var borderColors = {
    '#ee5d5b': '#BC3B3A',
    '#ff9625': '#c57f1d',
    '#6caeca': '#5188a5'
}

function Tip(options) {
    options = options || {}; 
    this._point = options.point;
    this._text = options.name;
    this._index = options.index;
    this._numberDirection = options.numberDirection || 'left';
    this._isShowNumber = options.isShowNumber !== undefined ? options.isShowNumber : true;
    this.color = options.color || '#ee5d5b';
    this.tipStyle = options.tipStyle
    this.textStyle = options.textStyle
    this.numberStyle = options.numberStyle
}

Tip.prototype = new BMap.Overlay();

Tip.prototype.changeColor = function(color){
    
    if (this._div) {
        this._div.style.backgroundColor = color;
        this._div.style.borderColor = borderColors[color];
        this._arrow.style.backgroundPosition = positions[color];
    }
}


Tip.prototype.initialize = function(map){
    this._map = map;
    var div = this._div = document.createElement("div");
    div.style.position = "absolute";
    div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
    div.style.backgroundColor = this.color;
    div.style.border = "1px solid " + borderColors[this.color];
    div.style.color = "white";
    div.style.height = "38px";
    div.style.boxSizing = 'border-box';
    div.style.padding = "5px";
    div.style.whiteSpace = "nowrap";
    div.style.MozUserSelect = "none";
    div.style.fontSize = "18px"

    div.style.border = "1px solid #a67972";
    div.style.color = "#494947";
    div.style.background = "#fff";
    div.style.borderRadius = '25px';
    div.style.paddingLeft = '30px';
    if(this.tipStyle) {
        for(var i in this.tipStyle) {
            div.style[i] = this.tipStyle[i]
        }
    }

    var span = this._span = document.createElement("span");
    div.appendChild(span);
    span.appendChild(document.createTextNode(this._text));
    if(this.textStyle) {
        for(var i in this.textStyle) {
            span.style[i] = this.textStyle[i]
        }
    }

    var arrow = this._arrow = document.createElement("div");
    arrow.style.backgroundPosition = positions[this.color];
    arrow.style.position = "absolute";
    arrow.style.width = "11px";
    arrow.style.height = "10px";
    arrow.style.top = "26px";
    arrow.style.left = "10px";
    arrow.style.overflow = "hidden";
    div.appendChild(arrow);

    var number = this._number = document.createElement("div");
    number.style.background = this.color || "#f15e5c";
    number.style.color = "#fff";
    number.style.position = "absolute";
    number.style.top = "3px";
    number.style.position = "absolute";
    number.style.textAlign = "center";
    number.style.height = "30px";
    number.style.width = "30px";
    number.style.lineHeight = "30px";
    number.style.borderRadius = "30px";
    if(this.numberStyle) {
        for(var i in this.numberStyle) {
            number.style[i] = this.numberStyle[i]
        }
    }
    if (this._isShowNumber === false) {
        number.style.display = 'none';
    }

    this.renderDirection();

    number.innerHTML = this._index;
    div.appendChild(number);

    map.getPanes().labelPane.appendChild(div);

    return div;
}


Tip.prototype.setNumberLeft = function(){
    this._numberDirection = 'left';
    this.renderDirection();
}

Tip.prototype.setNumberRight = function(){
    this._numberDirection = 'right';
    this.renderDirection();
}

Tip.prototype.renderDirection = function(){
    var paddingLeft = this.tipStyle && this.tipStyle.paddingLeft;
    var paddingRight = this.tipStyle && this.tipStyle.paddingRight;
    var numLeft = this.numberStyle && this.numberStyle.left;
    var numRight = this.numberStyle && this.numberStyle.right;
    if (this._numberDirection == 'left') {
        if (this._isShowNumber) {
            this._div.style.paddingLeft = paddingLeft || '38px';
        } else {
            this._div.style.paddingLeft = paddingLeft || '8px';
        }
        this._div.style.paddingRight = paddingRight || '8px';
        this._number.style.left = numLeft || "5px";
        this._number.style.right = this.numberStyle && this.numberStyle.right || "initial";
    } else {
        this._div.style.paddingLeft = paddingLeft || '8px';
        if (this._isShowNumber) {
            this._div.style.paddingRight = paddingRight || '38px';
        } else {
            this._div.style.paddingRight = paddingRight || '8px';
        }
        this._number.style.left = numLeft || "initial";
        this._number.style.right = numRight || "5px";
    }
}


Tip.prototype.hideNumber = function(){
    this._isShowNumber = false;
    this._number.style.display = this.numberStyle.display || "none";
    this.renderDirection();
}

Tip.prototype.setPosition = function(point){
    this._point = point;
    this.draw();
}

Tip.prototype.hideArrow = function(){
    this._arrow.style.display = 'none';
}

Tip.prototype.draw = function(){
    var map = this._map;
    this._span.innerHTML = this._text;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x + 5 + "px";
    this._div.style.top  = pixel.y - 20 + "px";
}

export default Tip;
