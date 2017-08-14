/**
 * @file 道路组件
 * nikai@baidu.com
 */

import Component from './component';
import {baiduMapCanvasLayer} from 'mapv';
import mapLine from '../utils/map-line';
import geoUtils from '../utils/geo-utils';

export default class App extends Component {
    constructor(args) {
        super(args);
        this.state = {
        };
    }

    componentDidUpdate(prevProps) {
        this.initialize();

    }

    updateViewport() {

        var roadPath = this.props.roadPath;

        var points = [];
        if (roadPath) {
            for (var i = 0; i < roadPath.length; i++) {
                var tmp = roadPath[i].split(',');
                for (var j = 0; j < tmp.length; j += 2) {
                    points.push(new BMap.Point(tmp[j], tmp[j + 1]));
                }
            }
        }

        if (points.length > 0 && this.props.autoViewport !== false) {
            this.props.map.setViewport(points, this.props.viewportOptions);
        }
    }

    getRoadGroup() {
        var roadPath = this.props.roadPath;
        var category = this.props.category;
        var splitList = this.props.splitList;
        var data = {};
        var allPath = [];
        if (category) {
            for (var i = 0; i < category.length; i++) {
                if (!data[category[i]]) {
                    data[category[i]] = {
                        roadPath: [],
                        color: splitList[category[i]]
                    };
                }
                allPath.push(roadPath[i]);
                data[category[i]].roadPath.push(roadPath[i]);
            }
        } else {
            data[0] = {
                roadPath: roadPath,
                color: this.props.color || '#1495ff'
            };
        }
        return {
            group: data,
            allPath: geoUtils.mergeRoadPath(roadPath)
        };
    }

    initialize() {
        var map = this.props.map;
        if (!map) {
            return;
        }

        const update = this.canvasLayerUpdate.bind(this);
        if (this.canvasLayer) {
            this.canvasLayer.draw();
        } else {
            this.canvasLayer = new baiduMapCanvasLayer({
                map,
                update() {
                    update(this);
                }
            });
        }

        this.updateViewport();
        
    }

    canvasLayerUpdate(canvasLayer) {
        const ctx = canvasLayer.canvas.getContext('2d');
        if (!ctx) {
            return false;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        var roadPath = this.props.roadPath;

        if (roadPath) {
            var roadGroup = this.getRoadGroup();
            var data = roadGroup.group;

            mapLine.drawRoads(this.props.map, ctx, roadGroup.allPath, {
                color: '#fff',
                lineWidth: 14,
                lineCap: 'butt',
                arrow: false,
                line: true
            });

            for (var key in data) {
                var item = data[key];
                var roadPath = geoUtils.mergeRoadPath(item.roadPath);
                mapLine.drawRoads(this.props.map, ctx, roadPath, {
                    color: item.color,
                    line: true,
                    lineWidth: 10,
                    lineCap: 'butt',
                    arrow: false
                });
            };

            mapLine.drawRoads(this.props.map, ctx, roadGroup.allPath, {
                color: item.color,
                lineWidth: 10,
                border: {
                },
                lineCap: 'butt',
                arrow: {
                    width: 5,
                    height: 3
                }
            });
        }

    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        this.canvasLayer.hide();
    }

}
