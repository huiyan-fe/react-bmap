
var App = {
    mergeRoadPath(roadPath, options) {
        var newRoadPath = [];
        for (var i = 0; i < roadPath.length; i++) {
            if (newRoadPath.length == 0) {
                newRoadPath.push(roadPath[i]);
            } else {
                var item = roadPath[i].split(',');
                var last = newRoadPath[newRoadPath.length - 1].split(',');
                if (item[0] === last[last.length - 2] && item[1] === last[last.length - 1]) {
                    var add = item.slice(2);
                    newRoadPath[newRoadPath.length - 1] += ',' + add.join(',');
                } else {
                    newRoadPath.push(roadPath[i]);
                }
            }
        }

        newRoadPath = this.uniqueRoadPath(newRoadPath);

        return newRoadPath;
    },

    uniqueRoadPath(roadPath) {
        var newRoadPath = [];
        for (var i = 0; i < roadPath.length - 1; i++) {
            if (!roadPath[i]) {
                continue;
            }
            var ref = roadPath[i].split(',');
            for (var j = i + 1; j < roadPath.length; j++) {
                if (roadPath[j]) {
                    var line = roadPath[j].split(',');
                    var flag = true;
                    for (var z = 0; z < line.length; z += 2) {
                        var tmp = this.isPointOnPolyline({
                            lng: line[z],
                            lat: line[z + 1]
                        }, ref);
                        if (tmp == false) {
                            flag = false;
                        } else {
                        }
                    }
                    if (flag) {
                        delete roadPath[j];
                    }
                }
            }
        }
        return roadPath;
    },

    /**
     * 判断点是否在折线上
     * @param {Point} point 点对象
     * @param {Polyline} polyline 折线对象
     * @returns {Boolean} 点在折线上返回true,否则返回false
     */
    isPointOnPolyline(point, polyline){

        //todo首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false

        //判断点是否在线段上，设点为Q，线段为P1P2 ，
        //判断点Q在该线段上的依据是：( Q - P1 ) × ( P2 - P1 ) = 0，且 Q 在以 P1，P2为对角顶点的矩形内
        var pts = polyline;
        for(var i = 0; i < pts.length - 2; i++){

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
                point.lat >= Math.min(curPt.lat, nextPt.lat) && point.lat <= Math.max(curPt.lat, nextPt.lat)){
                //判断点是否在直线上公式
                var precision = (curPt.lng - point.lng) * (nextPt.lat - point.lat) - 
                    (nextPt.lng - point.lng) * (curPt.lat - point.lat);                
                var diff = 2e-10;
                diff = 2e-9;
                if(precision < diff && precision > -diff){//实质判断是否接近0
                    return true;
                }                
            }
        }
        
        return false;
    }

}

export default App;
