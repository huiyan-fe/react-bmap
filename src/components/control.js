/**
 * @file 控件基类
 * @author kyle(hinikai@gmail.com)
 */

import Component from './component';

export default class Control extends Component {
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
        this.props.map.removeControl(this.control);
        this.control = null;
    }

    initialize() {
        var map = this.props.map;
        if (!map) {
            return;
        }

        this.destroy();
        this.control = this.getControl();
        map.addControl(this.control);

    }

    getControl() {
        return null;
    }

}
