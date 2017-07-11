
var App = {
    mergeRoadPath(roadPath, options) {
        if (!roadPath) {
            return;
        }
        var newRoadPath = [];
        for (var i = 0; i < roadPath.length; i++) {
            if (newRoadPath.length == 0) {
                newRoadPath.push(roadPath[i]);
            } else {
                var item = roadPath[i].split(',');
                var isAdd = false;
                for (var j = 0; j < newRoadPath.length; j++) {
                    var last = newRoadPath[j].split(',');
                    if (item[0] === last[last.length - 2] && item[1] === last[last.length - 1]) {
                        var add = item.slice(2);
                        newRoadPath[j] += ',' + add.join(',');
                        isAdd = true;
                    } 

                    if (item[item.length - 2] === last[0] && item[item.length - 1] === last[1]) {
                        var add = item.slice(0, item.length - 2);
                        newRoadPath[j] = add.join(',') + ',' + newRoadPath[j];
                        isAdd = true;
                    }
                }
                if (isAdd === false) {
                    newRoadPath.push(roadPath[i]);
                }
            }
        }

        newRoadPath = this.uniqueRoadPath(newRoadPath);

        return newRoadPath;
    },

    uniqueRoadPath(roadPath) {
        var tmpRoadPath = roadPath.map(function (line) {
            return new Polyline(line.split(','));
        });

        for (var i = 0; i < tmpRoadPath.length - 1; i++) {
            if (!tmpRoadPath[i]) {
                continue;
            }
            var ref = tmpRoadPath[i];
            for (var j = i + 1; j < tmpRoadPath.length; j++) {
                if (tmpRoadPath[j]) {
                    var line = tmpRoadPath[j];
                    if (line.isInclude(ref)) {
                        delete tmpRoadPath[j];
                    }

                }
            }
        }

        var newRoadPath = [];
        tmpRoadPath.map(function (line) {
            if (line) {
                newRoadPath.push(line.getPoints().join(','));
            }
        });

        return newRoadPath;
    },

    

}

function Polyline(pts) {
    this.polyline = pts;

    var minX = pts[0];
    var maxX = pts[0];
    var minY = pts[1];
    var maxY = pts[1];

    for (var i = 2; i < pts.length; i += 2) {
        minX = Math.min(minX, pts[i]);
        maxX = Math.max(maxX, pts[i]);
        minY = Math.min(minY, pts[i + 1]);
        maxY = Math.max(maxY, pts[i + 1]);
    }

    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;

}

Polyline.prototype.getPoints = function () {
    return this.polyline;
}

Polyline.prototype.isInBound = function (point) {
    if (point.lng > this.minX && point.lat > this.minY && point.lng < this.maxX && point.lat < this.maxY) {
        return true;
    } else {
        return false;
    }
}


Polyline.prototype.isInclude = function (polyline) {
    if (!(polyline.minX > this.minX && polyline.minY > this.minY && polyline.maxX < this.maxX && polyline.maxY < this.maxY)) {
        return false;
    }

    var line = this.getPoints();

    var flag = true;
    for (var z = 0; z < line.length; z += 2) {
        var tmp = this.isPointOnPolyline({
            lng: line[z],
            lat: line[z + 1]
        }, polyline);

        if (tmp == false) {
            flag = false;
        }
    }

    return flag;
}

/**
 * 判断点是否在折线上
 * @param {Point} point 点对象
 * @param {Polyline} polyline 折线对象
 * @returns {Boolean} 点在折线上返回true,否则返回false
 */
Polyline.prototype.isPointOnPolyline = function (point, polyline) {
    var pts = polyline.getPoints();

    if (!polyline.isInBound(point)) {
        return false;
    }

    //判断点是否在线段上，设点为Q，线段为P1P2 ，
    //判断点Q在该线段上的依据是：( Q - P1 ) × ( P2 - P1 ) = 0，且 Q 在以 P1，P2为对角顶点的矩形内
    for (var i = 0; i < pts.length - 2; i++) {

        var curPt = {
            lng: pts[i],
            lat: pts[i + 1]
        }

        var nextPt = {
            lng: pts[i + 2],
            lat: pts[i + 3]
        }

        //首先判断point是否在curPt和nextPt之间，即：此判断该点是否在该线段的外包矩形内
        if (point.lng >= Math.min(curPt.lng, nextPt.lng) && point.lng <= Math.max(curPt.lng, nextPt.lng) &&
            point.lat >= Math.min(curPt.lat, nextPt.lat) && point.lat <= Math.max(curPt.lat, nextPt.lat)) {
            //判断点是否在直线上公式
            var precision = (curPt.lng - point.lng) * (nextPt.lat - point.lat) -
                (nextPt.lng - point.lng) * (curPt.lat - point.lat);
            var diff = 2e-10;
            diff = 2e-9;
            if (precision < diff && precision > -diff) {//实质判断是否接近0
                return true;
            }
        }
    }

    return false;
}

export default App;
