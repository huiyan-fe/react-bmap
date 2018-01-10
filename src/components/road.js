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
        var projection = this.props.map.getMapType().getProjection();
        var points = [];
        for (var i = 0; i < roadPath.length; i++) {
            var tmp = roadPath[i].split(',');
            for (var j = 0; j < tmp.length; j += 2) {
                if (this.props.coordType === 'bd09mc') {
                    points.push(projection.pointToLngLat(new BMap.Pixel(tmp[j], tmp[j + 1])));
                } else {
                    points.push(new BMap.Point(tmp[j], tmp[j + 1]));
                }
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
        var lineWidth = this.props.lineWidth || 10;
        mapLine.drawRoads(map, ctx, roadGroup.allPath, {
            color: '#fff',
            lineWidth: lineWidth + 4,
            lineCap: 'butt',
            arrow: false,
            line: false
        });
        ctx.lineWidth = lineWidth + 6;
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
                zIndex: this.props.zIndex,
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

        var lineWidth = this.props.lineWidth || 10;

        if (roadPaths) {
            roadPaths.forEach((roadPath, index) => {
                if (this.props.lineWidths) {
                    lineWidth = this.props.lineWidths[index];
                }
                this.drawRoad(ctx, roadPath, this.props.category, this.props.splitList, lineWidth);
            });
        } else if(roadPath) {
            this.drawRoad(ctx, this.props.roadPath, this.props.category, this.props.splitList, lineWidth);
        }

    }

    drawRoad(ctx, roadPath, category, splitList, lineWidth) {
        var roadGroup = this.getRoadGroup(roadPath, category, splitList);
        var data = roadGroup.group;

        mapLine.drawRoads(this.props.map, ctx, roadGroup.allPath, {
            color: '#fff',
            coordType: this.props.coordType,
            lineWidth: lineWidth + 4,
            lineCap: 'butt',
            arrow: false,
            line: true
        });

        for (var key in data) {
            var item = data[key];
            var roadPath = geoUtils.mergeRoadPath(item.roadPath);
            mapLine.drawRoads(this.props.map, ctx, roadPath, {
                color: item.color,
                coordType: this.props.coordType,
                line: true,
                lineWidth: lineWidth,
                lineCap: 'butt',
                arrow: false
            });
        };

        mapLine.drawRoads(this.props.map, ctx, roadGroup.allPath, {
            color: item.color,
            coordType: this.props.coordType,
            lineWidth: lineWidth,
            border: {
            },
            lineCap: 'butt',
            arrow: this.props.isShowArrow !== false ? {
                width: 5,
                height: 3
            } : false
        });
    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        this.canvasLayer.hide();
    }

}
