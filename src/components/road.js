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

    getRoadPoints(roadPath) {
        var points = [];
        for (var i = 0; i < roadPath.length; i++) {
            var tmp = roadPath[i].split(',');
            for (var j = 0; j < tmp.length; j += 2) {
                points.push(new BMap.Point(tmp[j], tmp[j + 1]));
            }
        }
        return points;
    }

    updateViewport() {

        var roadPath = this.props.roadPath;
        var points = [];

        if (this.props.roadPaths) {
            this.props.roadPaths.forEach((roadPath) => {
                points = points.concat(this.getRoadPoints(roadPath));
            });
        } else if (this.props.roadPath) {
            points = points.concat(this.getRoadPoints(this.props.roadPath));
        }

        if (points.length > 0 && this.props.autoViewport !== false) {
            this.props.map.setViewport(points, this.props.viewportOptions);
        }
    }

    getRoadGroup(roadPath, category, splitList) {
        var roadPath = roadPath;
        var category = category;
        var splitList = splitList;
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

    isClick(map, pixel, roadPath) {
        const ctx = this.canvasLayer.canvas.getContext('2d');
        var roadGroup = this.getRoadGroup(roadPath);
        ctx.beginPath();
        mapLine.drawRoads(map, ctx, roadGroup.allPath, {
            color: '#fff',
            lineWidth: 14,
            lineCap: 'butt',
            arrow: false,
            line: false
        });
        ctx.lineWidth = 16;
        var isPointInStroke = ctx.isPointInStroke(pixel.x * window.devicePixelRatio, pixel.y * window.devicePixelRatio);
        return isPointInStroke;
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
            if (this.props.onClick) {
                map.addEventListener('click', (e) => {

                    var isClick = false;
                    if (this.props.roadPaths) {
                        for (var i = 0; i < this.props.roadPaths.length; i++) {
                            var roadPath = this.props.roadPaths[i];
                            isClick = this.isClick(map, e.pixel, roadPath);
                            if (isClick) {
                                this.props.onClick(i); 
                            }
                        };
                    } else if (this.props.roadPath) {
                        isClick = this.isClick(map, e.pixel, this.props.roadPath);
                        if (isClick) {
                            this.props.onClick(); 
                        }
                    }



                    
                });
            }
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
        var roadPaths = this.props.roadPaths;

        if (roadPaths) {
            roadPaths.forEach((roadPath) => {
                this.drawRoad(ctx, roadPath, this.props.category, this.props.splitList);
            });
        } else if(roadPath) {
            this.drawRoad(ctx, this.props.roadPath, this.props.category, this.props.splitList);
        }

    }

    drawRoad(ctx, roadPath, category, splitList) {
        var roadGroup = this.getRoadGroup(roadPath, category, splitList);
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

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        this.canvasLayer.hide();
    }

}
