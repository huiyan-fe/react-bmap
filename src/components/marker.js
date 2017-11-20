/**
 * @file 地图标注组件
 * @author kyle(hinikai@gmail.com)
 */

import React from 'react';
import { render } from 'react-dom';
import Component from './component';
import CustomOverlay from '../overlay/CustomOverlay';

const defaultIconUrl = 'http://webmap1.map.bdstatic.com/wolfman/static/common/images/markers_new2x_fbb9e99.png';

var icons = {
    'simple_red': new BMap.Icon(defaultIconUrl , new BMap.Size(42 / 2, 66 / 2), {
        imageOffset: new BMap.Size(-454 / 2, -378 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'simple_blue': new BMap.Icon(defaultIconUrl , new BMap.Size(42 / 2, 66 / 2), {
        imageOffset: new BMap.Size(-454 / 2, -450 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'loc_red': new BMap.Icon(defaultIconUrl , new BMap.Size(46 / 2, 70 / 2), {
        imageOffset: new BMap.Size(-400 / 2, -378 / 2),
        anchor: new BMap.Size(46 / 2 / 2, 70 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'loc_blue': new BMap.Icon(defaultIconUrl , new BMap.Size(46 / 2, 70 / 2), {
        imageOffset: new BMap.Size(-400 / 2, -450 / 2),
        anchor: new BMap.Size(46 / 2 / 2, 70 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'start': new BMap.Icon(defaultIconUrl , new BMap.Size(50 / 2, 80 / 2), {
        imageOffset: new BMap.Size(-400 / 2, -278 / 2),
        anchor: new BMap.Size(50 / 2 / 2, 80 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'end': new BMap.Icon(defaultIconUrl , new BMap.Size(50 / 2, 80 / 2), {
        imageOffset: new BMap.Size(-450 / 2, -278 / 2),
        anchor: new BMap.Size(50 / 2 / 2, 80 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
}

for (var i = 1; i <= 10; i++) {
    icons['red' + i] = new BMap.Icon(defaultIconUrl , new BMap.Size(42 / 2, 66 / 2), {
        imageOffset: new BMap.Size(0 - 42 / 2 * (i - 1), 0),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    });
}

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

    /**
     * 获取可以给marker绑定的事件名
     */
    get events() {
        return [
            'click',
            'dblclick',
            'mousedown',
            'mouseup',
            'mouseout',
            'mouseover',
            'remove',
            'infowindowclose',
            'infowindowopen',
            'dragstart',
            'dragging',
            'dragend',
            'rightclick'
        ];
    }

    get toggleMethods() {
        return {
            enableMassClear: ['enableMassClear', 'disableMassClear'],
            enableDragging: ['enableDragging', 'disableDragging']
        }
    }

    get options() {
        return [
            'offset',
            'icon',
            'enableMassClear',
            'enableDragging',
            'enableClicking',
            'raiseOnDrag',
            'draggingCursor',
            'rotation',
            'shadow',
            'title'
        ];
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
        this.props.map.removeOverlay(this.marker);
        this.marker = null;
    }

    initialize() {

        var map = this.props.map;
        if (!map) {
            return;
        }

        this.destroy();

        var icon;
        var propsIcon = this.props.icon;

        if (propsIcon && propsIcon instanceof BMap.Icon) {
            icon = propsIcon;
        } else {
            if (propsIcon && icons[propsIcon]) {
                icon = icons[propsIcon];
            } else {
                icon = icons.simple_red;
            }
        }

        if (this.props.coordType === 'bd09mc') {
            var projection = map.getMapType().getProjection();
            var position = projection.pointToLngLat(new BMap.Pixel(this.props.position.lng, this.props.position.lat));
        } else {
            var position = new BMap.Point(this.props.position.lng, this.props.position.lat);
        }

        if ('children' in this.props) {
            this.contentDom = document.createElement('div');
            const child = this.props.children;
            render(<div>{child}</div>, this.contentDom)
            this.marker = new CustomOverlay(position, this.contentDom, this.props.offset);
            map.addOverlay(this.marker);
        } else {
            var options = this.getOptions(this.options);
            options.icon = icon;
            this.marker = new BMap.Marker(position, options);
            if (this.props.isTop) {
                this.marker.setTop(true);
            }
            this.bindEvent(this.marker, this.events);

            map.addOverlay(this.marker);
            this.bindToggleMeghods(this.marker, this.toggleMethods);
        }

        if (this.props.autoViewport) {
            map.panTo(position);
        }

        if(this.props.autoCenterAndZoom) {
            map.setViewport([position],this.props.centerAndZoomOptions);
        }
    }

}
