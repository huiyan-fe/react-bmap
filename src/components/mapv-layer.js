import Component from './component';
import {DataSet, baiduMapLayer} from 'mapv';

export default class App extends Component {
    constructor(args) {
        super(args);
        this.state = {
        };
    }

    static get defaultProps() {
        return {
        }
    }

    handleClick(id) {
        this.props.onClick && this.props.onClick(id);
    }

    componentDidUpdate(prevProps) {
        var preData = JSON.stringify(prevProps.data);
        var data = JSON.stringify(this.props.data);
        if (preData != data || !this.map) {
            this.initialize();
        }
    }

    initialize() {

        var self = this;
        var map = this.props.map;
        if (!map) {
            return;
        }
        this.map = map;

        if (!this._createLayer) {
            this.createLayers();
        }

        this.dataSet.set(this.props.data);
        this.layer.update({
            options: this.props.options
        });

        
    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        this.layer.dispose();
        this.layer = null;
    }

    createLayers() {
        this._createLayer = true;
        var map = this.map;

        let self = this;
        let dataSet = this.dataSet = new DataSet([]);
        this.layer = new baiduMapLayer(map, dataSet, {});

    }

    render() {
        return null;
    }
}
