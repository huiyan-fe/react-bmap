/**
 * @file 地图的平移缩放控件，可以对地图进行上下左右四个方向的平移和缩放操作
 * @author kyle(hinikai@gmail.com)
 */

import Control from './control';

export default class App extends Control {
    constructor(args) {
        super(args);
    }

    get options() {
        return ['anchor', 'offset', 'type', 'showZoomInfo', 'enableGeolocation'];
    }

    getControl() {
        return new BMap.NavigationControl(this.getOptions(this.options));
    }

}
