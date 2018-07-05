/**
 * @file 地图标注组件
 * @author kyle(hinikai@gmail.com)
 */

import React from 'react';
import { render } from 'react-dom';
import Component from './component';
import CustomOverlay from '../overlay/CustomOverlay';
import {isString} from '../utils/common';

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
		var that = this;

        if (propsIcon && propsIcon instanceof BMap.Icon) {
            icon = propsIcon;
        } else {
            if (propsIcon && icons[propsIcon]) {
                icon = icons[propsIcon];
            } else {
                icon = icons.simple_red;
            }
        }

        if (isString(this.props.position)) { // 可以传入详细地址，地址错误默认为厦门市
		var myGeo = new BMap.Geocoder();
        var position = myGeo.getPoint(this.props.position, function(point){
				if (point) {
					position = point;
					nextDo();
				}
            },
            "厦门市");
        }else {
           var position = new BMap.Point(this.props.position.lng, this.props.position.lat);
           nextDo();
        }
		
        function nextDo(){
			if ('children' in that.props) {
				that.contentDom = document.createElement('div');
				const child = that.props.children;
				render(<div>{child}</div>, that.contentDom)
				that.marker = new CustomOverlay(position, that.contentDom, that.props.offset);
				map.addOverlay(that.marker);
			} else {
				var options = that.getOptions(that.options);
				options.icon = icon;
				that.marker = new BMap.Marker(position, options);
				if (that.props.isTop) {
					that.marker.setTop(true);
				}
				that.bindEvent(that.marker, that.events);

				map.addOverlay(that.marker);
				that.bindToggleMeghods(that.marker, that.toggleMethods);
			}

			if (that.props.autoViewport) {
				map.panTo(position);
			}

			if(that.props.autoCenterAndZoom) {
				map.setViewport([position],that.props.centerAndZoomOptions);
			}
		}
    }

}
