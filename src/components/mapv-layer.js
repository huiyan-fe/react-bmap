import Component from './component';
import {DataSet, baiduMapLayer} from 'mapv';

export default class MapvLayer extends Component {
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

        if (this.props.options.autoViewport) {
            var getPoint = (coordinate) => {
                if (this.props.options.coordType === 'bd09mc') {
                    return projection.pointToLngLat(new BMap.Pixel(coordinate[0], coordinate[1]));
                } else {
                    return new BMap.Point(coordinate[0], coordinate[1]);
                }
            }

            var projection = map.getMapType().getProjection();
            var points = [];

            this.props.data.map(item => {
                if (item.geometry.type === 'Point') {
                    points.push(getPoint(item.geometry.coordinates));
                } else if (item.geometry.type === 'Polygon') {
                    item.geometry.coordinates[0].map((item) => {
                        points.push(getPoint(item));
                    });
                }
            });

            map.setViewport(points, this.props.options.viewportOptions);
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
        this.layer.destroy();
        this.layer = null;
    }

    createLayers() {
        this._createLayer = true;
        var map = this.map;

        let self = this;
        let dataSet = this.dataSet = new DataSet([]);
        this.layer = new baiduMapLayer(map, dataSet, {});

    }

}
