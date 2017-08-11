import Component from './component';
import {DataSet, baiduMapLayer} from 'mapv';

export default class Boundary extends Component {
    constructor(args) {
        super(args);
        this.state = {
        };
    }

    componentDidUpdate(prevProps) {
        this.initialize();
    }

    componentDidMount() {
        this._allRequest = {};
        this._backData = {};
        this.initialize();
    }

    componentWillUnmount() {
        if (this.mapvLayer) {
            this.mapvLayer.destroy();
            this.mapvLayer = null;
        }
    }

    getPointArrayByDataSetData(dataSetData) {
        var points = [];
        for (var i = 0; i < dataSetData.length; i++) {
            var coordinates = dataSetData[i].geometry.coordinates[0];
            coordinates.forEach(function (coordinate) {
                points.push(new BMap.Point(coordinate[0], coordinate[1]));
            });
        }
        return points;
    }

    getBoundaryData() {
        var sell = this;
        var data = this.props.data;
        var map = this.props.map;

        if (!data) {
            return;
        }

        this._request = {};
        var self = this;
        var bdary = new BMap.Boundary();
        var dataSetData = [];

        function isAllComplete() {
            var flag = true;
            for (var key in self._request) {
                if (!self._request[key]) {
                    flag = false;
                }
            }

            if (flag) {
                self.dataSet.set(dataSetData);
                var points = self.getPointArrayByDataSetData(dataSetData);
                if (points.length > 0 && self.props.autoViewport !== false) {
                    map.setViewport(points, self.props.viewportOptions);
                }
            }
        }

        data.forEach(function (item, index) {
            self._request[item.name] = false;
            if (self._backData[item.name]) {
                dataSetData = dataSetData.concat(self._backData[item.name]);
                self._request[item.name] = true;
            }
        });

        isAllComplete();

        data.forEach(function (item, index) {
            if (self._request[item.name]) {
                return;
            }

            if (self._allRequest[item.name]) {
                return;
            } else {
                self._allRequest[item.name] = true;
            }

            bdary.get(item.name, function(rs){       //获取行政区域
                var tmpData = [];
                for (var i = 0; i < rs.boundaries.length; i++) {
                    var coordinates = [];
                    var path = rs.boundaries[i].split(';');
                    for (var j = 0; j < path.length; j++) {
                        coordinates.push(path[j].split(','));
                    }

                    tmpData.push({
                        geometry: {
                            type: 'Polygon',
                            coordinates: [coordinates]
                        },
                        count: item.count
                    });
                }
                self._backData[item.name] = tmpData;
                dataSetData = dataSetData.concat(tmpData);
                self._request[item.name] = true;
                isAllComplete();
            });
        });
        
    }

    initialize() {
        var map = this.props.map;
        if (!map) {
            return;
        }

        if (!this.mapvLayer) {
            this.dataSet = new DataSet([]);

            var options = this.props.layerOptions || {
                gradient: {
                    0: 'yellow',
                    1: 'red'
                },
                max: 100,
                globalAlpha: 0.8,
                draw: 'intensity'
            }

            this.mapvLayer = new baiduMapLayer(map, this.dataSet, options);
        }

        this.getBoundaryData();
    }
}

