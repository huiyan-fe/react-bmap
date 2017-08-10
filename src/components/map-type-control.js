/**
 * @file 负责切换地图类型的控件
 * @author kyle(hinikai@gmail.com)
 */

import Control from './control';

export default class MapTypeControl extends Control {
    constructor(args) {
        super(args);
    }

    get options() {
        return ['anchor', 'offset', 'type', 'mapTypes'];
    }

    getControl() {
        return new BMap.MapTypeControl(this.getOptions(this.options));
    }

}
