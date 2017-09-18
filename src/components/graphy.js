/**
 * @file 图形基类
 * @author kyle(hinikai@gmail.com)
 */

import Component from './component';

export default class Graphy extends Component {

    constructor(args) {
        super(args);
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
        this.props.map.removeOverlay(this.overlay);
        this.overlay = null;
    }

    initialize() {
        var map = this.props.map;
        if (!map) {
            return;
        }

        this.destroy();

        this.overlay = this.getOverlay();
        this.bindEvent(this.overlay, this.events);
        map.addOverlay(this.overlay);


        var path = this.overlay.getPath();
        if (path && path.length > 0 && this.props.autoViewport === true) {
            map.setViewport(path, this.props.viewportOptions);
        }

    }

    get options() {
        return [
            'strokeColor',
            'fillColor',
            'strokeWeight',
            'strokeOpacity',
            'fillOpacity',
            'strokeStyle',
            'enableMassClear',
            'enableEditing',
            'enableClicking'
        ];
    }

    /**
     * 获取可以绑定的事件名
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
            'lineupdate'
        ];
    }

    getOverlay() {
        return null;
    }

}
