/**
 * @file 比例尺控件
 * @author kyle(hinikai@gmail.com)
 */

import Control from './control';

export default class App extends Control {

    constructor(args) {
        super(args);
    }

    get options() {
        return ['anchor', 'offset'];
    }

    getControl() {
        return new BMap.ScaleControl(this.getOptions(this.options));
    }

}
