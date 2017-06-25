/**
 * @file 缩略地图控件
 * @author kyle(hinikai@gmail.com)
 */

import Control from './control';

export default class App extends Control {
    constructor(args) {
        super(args);
    }

    get options() {
        return ['anchor', 'offset', 'size', 'isOpen'];
    }

    getControl() {
        return new BMap.OverviewMapControl(this.getOptions(this.options));
    }

}
