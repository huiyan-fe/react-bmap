import Control from './control';

export default class GeolocationControl extends Control {
    constructor(args) {
        super(args);
    }

    get options() {
        return ['anchor', 'offset', 'showAddressBar', 'enableAutoLocation', 'locationIcon'];
    }

    getControl() {
        return new BMap.GeolocationControl(this.getOptions(this.options));
    }

}
