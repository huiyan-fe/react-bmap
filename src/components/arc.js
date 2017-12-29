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
    }

    createLayers() {

        this._createLayer = true;
        var map = this.map;

        let self = this;
        this.lineDataSet = new DataSet([]);
        this.lineLayer = new baiduMapLayer(map, this.lineDataSet, {});

        this.pointDataSet = new DataSet([]);
        this.pointLayer = new baiduMapLayer(map, this.pointDataSet, {});

    }

    initialize() {

        var map = this.map = this.props.map;
        if (!map) {
            return;
        }

        if (!this._createLayer) {
            this.createLayers();
        }

        this.destroy();

        var lineData = [];
        var pointData = [];
        var options = this.props.options || {};

        if (this.props.data) {
            this.props.data.forEach((item, index) => {
                var fromCenter = item.from.point || utilCityCenter.getCenterByCityName(item.from.name);
                var toCenter = item.to.point || utilCityCenter.getCenterByCityName(item.to.name);
                var curve = utilCurve.getPoints([fromCenter, toCenter]);
                lineData.push({
                    geometry: {
                        type: 'LineString',
                        coordinates: curve
                    }
                });

                if (options.showToPoint !== false) {
                    pointData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [toCenter.lng, toCenter.lat]
                        }
                    });
                }

                if (options.showFromPoint !== false) {
                    pointData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [fromCenter.lng, fromCenter.lat]
                        }
                    });
                }

            });
        }

        this.lineDataSet.set(lineData);
        this.lineLayer.update({
            options: {
                draw: 'simple',
                strokeStyle: '#5E87DB',
                lineWidth: 3
            }
        });


        this.pointDataSet.set(pointData);
        this.pointLayer.update({
            options: {
                draw: 'simple',
                fillStyle: '#5E87DB',
                strokeStyle: 'rgba(94,135,219,0.3)',
                lineWidth: 5,
                size: 5
            }
        });
    }

}
