/**
 * @file 折线覆盖物
 * @author kyle(hinikai@gmail.com)
 */

import Graphy from './graphy';

export default class App extends Graphy {

    constructor(args) {
        super(args);
    }

    getOverlay() {

        var path = this.props.path;

        path = path.map((item) => {
            return new BMap.Point(item.lng, item.lat);
        });

        return new BMap.Polyline(path, this.getOptions(this.options));
    }

}
