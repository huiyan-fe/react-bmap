/**
 * @file 文本标注组件
 * @author kyle(hinikai@gmail.com)
 */

import React from 'react';
import { render } from 'react-dom';
import Component from './component';
import DraggingTip from '../overlay/DraggingTip';

export default class App extends Component {

    constructor(args) {
        super(args);
        this.state = {
        };
        this.tips = [];
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
        this.tips.forEach((tip) => {
            tip.hide();
        });
        this.tips = [];
    }

    initialize() {

        var map = this.props.map;
        if (!map) {
            return;
        }

        this.destroy();

        if (this.props.autoViewport) {
        }

        if(this.props.autoCenterAndZoom) {
            //map.setViewport([position],this.props.centerAndZoomOptions);
        }

        if (this.props.data) {
            this.props.data.forEach(function (item, index) {
                var tip = new DraggingTip({
                    isShowTipArrow: true,
                    map: map,
                    numberDirection: item.numberDirection,
                    isShowNumber: item.isShowNumber,
                    point: item.point,
                    name: item.name,
                    index: item.index !== undefined ? item.index : index + 1, 
                    color: item.color,
                    change: function() {}
                });
                tip.show();
                this.tips.push(tip);
            });
        }
    }

}
