/**
 * @file 信息窗口组件
 * @author kyle(hinikai@gmail.com)
 */

import Component from './component';

export default class Infowindow extends Component {
    constructor(args) {
        super(args);
        this.state = {
        };
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
        this.props.map.closeInfoWindow();
        this.infoWindow = null;
    }

    get options() {
        return [
            'width',
            'height',
            'maxWidth',
            'offset',
            'title',
            'enableAutoPan',
            'enableCloseOnClick',
            'enableMessage',
            'message'
        ];
    }

    get events() {
        return [
            'close',
            'open',
            'maximize',
            'restore',
            'clickclose'
        ];
    }

    initialize() {
        var map = this.props.map;
        if (!map) {
            return;
        }

        this.destroy();

        var opts = {};
        this.infoWindow = new BMap.InfoWindow(this.props.text, this.getOptions(this.options));  // 创建信息窗口对象 
        this.bindEvent(this.infoWindow, this.events);
        map.openInfoWindow(this.infoWindow, new BMap.Point(this.props.position.lng, this.props.position.lat)); //开启信息窗口

    }

}
