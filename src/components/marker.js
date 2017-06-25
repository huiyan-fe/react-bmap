/**
 * @file 地图标注组件
 * @author kyle(hinikai@gmail.com)
 */

import Component from './component';

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

        if (propsIcon) {
            icon = propsIcon;
        } else {
            var defaultIconUrl = 'http://webmap1.map.bdstatic.com/wolfman/static/common/images/markers_new2x_fbb9e99.png';
            var iconWidth = 42 / 2;
            var iconHeight = 66 / 2;
            icon = new BMap.Icon(defaultIconUrl , new BMap.Size(iconWidth, iconHeight), {
                imageOffset: new BMap.Size(-454 / 2, -378 / 2),
                anchor: new BMap.Size(iconWidth / 2, iconHeight / 2),
                imageSize: new BMap.Size(600 / 2, 600 / 2)
            });
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
