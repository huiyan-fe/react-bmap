import Component from './component';
import {DataSet, baiduMapLayer, baiduMapAnimationLayer} from 'mapv';
import NumberMarker from '../overlay/NumberMarker';

export default class App extends Component {
    constructor(args) {
        super(args);
        this.state = {
        };
    }

    static get defaultProps() {
        return {
            autoViewport: true
        }
    }

    componentDidUpdate(prevProps) {
        var preData = JSON.stringify(prevProps.data);
        var data = JSON.stringify(this.props.data);
        if (preData != data || !this.map) {
            this.initialize();
        } else {
            this.setViewport();
        }
    }

    componentDidMount() {
        this.markers = [];
        this.initialize();
    }

    componentWillUnmount() {
        this.clearMarkers();

        if (this.textLayer) {
            this.textLayer.destroy();
            this.textLayer = null;
        }

        if (this.animationLayer) {
            this.animationLayer.destroy();
            this.animationLayer = null;
        }

    }

    clearMarkers() {
        for (var i = 0; i < this.markers.length; i++) {
            this.map.removeOverlay(this.markers[i]);
            this.markers[i] = null;
        }
        this.markers.length = 0;
    }

    initialize() {
        var self = this;
        var map = this.props.map;
        if (!map) {
            return;
        }

        this.map = map;

        this.clearMarkers();

        if (!this.textLayer) {
            this.dataSet = new DataSet([]);

            var options = this.props.textOptions || {
                fillStyle: '#666666',
                shadowBlur: 5,
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                globalAlpha: '0.9',
                textAlign: 'left',
                offset: {
                    x: 15,
                    y: 0
                },
                coordType: this.props.coordType,
                avoid: true,
                size: 12,
                textKey: 'text',
                draw: 'text'
            }

            if (this.props.isShowText !== false) {
                this.textLayer = new baiduMapLayer(map, this.dataSet, options);
            }

        }

        if (!this.animationLayer && this.props.animation === true) {
            var splitList = this.props.splitList || {};
            splitList.other = this.props.fillStyle || 'rgba(50, 50, 255, 0.5)'
            var animationOptions = {
                styleType: 'stroke',
                strokeStyle: this.props.fillStyle || 'rgba(20, 249, 255, 0.5)',
                coordType: this.props.coordType,
                splitList: splitList,
                globalAlpha: 0.4,
                size: this.props.multiple ? 20 : 26,
                minSize: this.props.multiple ? 10 : 13,
                draw: 'category'
            };
            this.animationLayer = new baiduMapAnimationLayer(map, this.dataSet, animationOptions);
        }

        var projection = map.getMapType().getProjection();

        var data = this.props.data;
        var mapvData = [];
        for (var i = 0; i < data.length; i++) {
            if (this.props.showIndex !== undefined && this.props.showIndex != i) {
                continue;
            }

            if (data[i].location) {
                var location = data[i].location.split(',');
                if (this.props.coordType && this.props.coordType === 'bd09mc') {
                    var point = projection.pointToLngLat(new BMap.Pixel(location[0], location[1]));
                } else {
                    var point = new BMap.Point(location[0], location[1]);
                }
                var fillStyle = data[i].color || this.props.fillStyle || '#1495ff';
                if (this.props.splitList) {
                    if (this.props.splitList[data[i].count]) {
                        fillStyle = this.props.splitList[data[i].count];
                    } else {
                        fillStyle = this.props.splitList.other;
                    }
                }

                var options = {
                    point: point,
                    fillStyle: fillStyle,
                    isShowShadow: this.props.isShowShadow,
                    size: 26,
                    zIndex: data.length - i,
                    number: i + 1
                }

                if (this.props.multiple) {
                    options.size = 20;
                    options.lineWidth = 0;
                    if (i >= 10) {
                        options.isShowNumber = false;
                        options.size = 10;
                        options.strokeStyle = fillStyle;
                        options.lineWidth = 3;
                        options.strokeOpacity = 0.4;
                    }
                }

                var marker = new NumberMarker(options);
                marker.addEventListener('click', function(e, number) {
                    self.props.onClick && self.props.onClick(number - 1);
                });

                marker.addEventListener('mouseover', function(e, number) {
                    self.props.onMouseOver && self.props.onMouseOver(number - 1);
                });

                marker.addEventListener('mouseout', function(e, number) {
                    self.props.onMouseOut && self.props.onMouseOut(number - 1);
                });

                marker.index = i;
                this.markers.push(marker);
                mapvData.push({
                    geometry: {
                        type: 'Point',
                        coordinates: [location[0], location[1]]
                    },
                    count: data[i].count,
                    text: data[i].text
                });
            } 
        }

        var length = this.markers.length;
        while (length--) {
            map.addOverlay(this.markers[length]);
        }

        this.dataSet.set(mapvData.splice(0, 10));

        this.setViewport();

    }

    setViewport() {
        var map = this.props.map;
        if (!map) {
            return;
        }
        var data = this.props.data;
        var projection = map.getMapType().getProjection();
        var points = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].location) {
                var location = data[i].location.split(',');
                if (this.props.coordType && this.props.coordType === 'bd09mc') {
                    var point = projection.pointToLngLat(new BMap.Pixel(location[0], location[1]));
                } else {
                    var point = new BMap.Point(location[0], location[1]);
                }
                points.push(point);
            }
        }

        if (points.length > 0 && this.props.autoViewport !== false) {
            map.setViewport(points, this.props.viewportOptions);
        }
    }

}
