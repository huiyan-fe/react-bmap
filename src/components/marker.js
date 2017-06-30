/**
 * @file 地图标注组件
 * @author kyle(hinikai@gmail.com)
 */

import Component from './component';

const defaultIconUrl = 'http://webmap1.map.bdstatic.com/wolfman/static/common/images/markers_new2x_fbb9e99.png';
var icons = {
    'simple_red': new BMap.Icon(defaultIconUrl , new BMap.Size(42 / 2, 66 / 2), {
        imageOffset: new BMap.Size(-454 / 2, -378 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'simple_blue': new BMap.Icon(defaultIconUrl , new BMap.Size(42 / 2, 66 / 2), {
        imageOffset: new BMap.Size(-454 / 2, -450 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'loc_red': new BMap.Icon(defaultIconUrl , new BMap.Size(46 / 2, 70 / 2), {
        imageOffset: new BMap.Size(-400 / 2, -378 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'loc_blue': new BMap.Icon(defaultIconUrl , new BMap.Size(46 / 2, 70 / 2), {
        imageOffset: new BMap.Size(-400 / 2, -450 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'start': new BMap.Icon(defaultIconUrl , new BMap.Size(50 / 2, 80 / 2), {
        imageOffset: new BMap.Size(-400 / 2, -278 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
    'end': new BMap.Icon(defaultIconUrl , new BMap.Size(50 / 2, 80 / 2), {
        imageOffset: new BMap.Size(-450 / 2, -278 / 2),
        anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
        imageSize: new BMap.Size(600 / 2, 600 / 2)
    }),
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

        var position = new BMap.Point(this.props.position.lng, this.props.position.lat);
        var options = this.getOptions(this.options);
        options.icon = icon;
        this.marker = new BMap.Marker(position, options);
        this.bindEvent(this.marker, this.events);

        map.addOverlay(this.marker);
        this.bindToggleMeghods(this.marker, this.toggleMethods);

    }

    render() {
        return null;
    }
}
