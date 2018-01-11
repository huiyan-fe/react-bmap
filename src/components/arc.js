/**
 * @file 迁徙组件
 * @author kyle(hinikai@gmail.com)
 */

import React from 'react';
import Component from './component';
import {DataSet, utilCityCenter, utilCurve, baiduMapLayer} from 'mapv';

export default class App extends Component {

    constructor(args) {
        super(args);
        this.state = {
        };
    }

    /**
     * 设置默认的props属性
     */
    static get defaultProps() {
        return {
        }
    }

    componentDidUpdate(prevProps) {
        this.initialize();
    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        this.destroy();
    }

    destroy() {
        this.lineLayer.destroy();
        this.lineLayer = null;
        this.pointLayer.destroy();
        this.pointLayer = null;
        this.textLayer.destroy();
        this.textLayer = null;
    }

    createLayers() {

        this._createLayer = true;
        var map = this.map;

        let self = this;
        this.lineDataSet = new DataSet([]);
        this.lineLayer = new baiduMapLayer(map, this.lineDataSet, {});

        this.pointDataSet = new DataSet([]);
        this.pointLayer = new baiduMapLayer(map, this.pointDataSet, {});

        this.textLayer = new baiduMapLayer(map, this.pointDataSet, {});

    }

    initialize() {

        var map = this.map = this.props.map;
        if (!map) {
            return;
        }

        if (!this._createLayer) {
            this.createLayers();
        }

        var lineData = [];
        var pointData = [];
        var options = this.props.options || {};


        if (this.props.data) {
            var points = [];
            var projection = map.getMapType().getProjection();

            this.props.data.forEach((item, index) => {
                var fromCenter = item.from.point || utilCityCenter.getCenterByCityName(item.from.city);
                var toCenter = item.to.point || utilCityCenter.getCenterByCityName(item.to.city);
                var curve = utilCurve.getPoints([fromCenter, toCenter]);

                if (this.props.coordType === 'bd09mc') {
                    points.push(projection.pointToLngLat(new BMap.Pixel(fromCenter.lng, fromCenter.lat)));
                    points.push(projection.pointToLngLat(new BMap.Pixel(toCenter.lng, toCenter.lat)));
                } else {
                    points.push(fromCenter);
                    points.push(toCenter);
                }

                lineData.push({
                    strokeStyle: item.color,
                    geometry: {
                        type: 'LineString',
                        coordinates: curve
                    }
                });

                if (options.showToPoint !== false) {
                    pointData.push({
                        fillStyle: item.color,
                        text: item.to.name || item.to.city,
                        geometry: {
                            type: 'Point',
                            coordinates: [toCenter.lng, toCenter.lat]
                        }
                    });
                }

                if (options.showFromPoint !== false) {
                    pointData.push({
                        fillStyle: item.color,
                        text: item.from.name || item.from.city,
                        geometry: {
                            type: 'Point',
                            coordinates: [fromCenter.lng, fromCenter.lat]
                        }
                    });
                }

                if (points.length > 0) {
                    if (this.props.autoViewport !== false) {
                        map.setViewport(points, this.props.viewportOptions);
                    }
                }
            });
        }

        this.lineDataSet.set(lineData);
        this.lineLayer.update({
            options: this.props.lineOptions || {
                draw: 'simple',
                strokeStyle: '#5E87DB',
                lineWidth: 3
            }
        });


        this.pointDataSet.set(pointData);
        this.pointLayer.update({
            options: this.props.pointOptions || {
                draw: 'simple',
                fillStyle: '#5E87DB',
                size: 5
            }
        });

        this.textLayer.update({
            options: this.props.textOptions || {
                draw: 'text',
                font: '18px Arial',
                offset: {
                    x: 0,
                    y: 12,
                },
                fillStyle: '#333',
                size: 12
            }
        });
    }

}
