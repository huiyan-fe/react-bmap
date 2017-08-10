/**
 * @file 圆形覆盖物
 * @author kyle(hinikai@gmail.com)
 */

import Graphy from './graphy';

export default class Circle extends Graphy {

    constructor(args) {
        super(args);
    }

    getOverlay() {
        var center = this.props.center;
        var radius = this.props.radius;
        return new BMap.Circle(center, radius, this.getOptions(this.options));
    }

}
