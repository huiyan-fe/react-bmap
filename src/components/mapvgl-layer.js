/**
 * @file mapvgl可视化图层
 * @author hedongran
 * @email hdr01@126.com
 */
import Component from './component';
import * as mapvgl from 'mapvgl';

export default class MapvglLayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static get defaultProps() {
        return {
        }
    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        if (this.layer) {
            this.props.view.removeLayer(this.layer);
            this.layer.destroy();
            this.layer = null;
        }
    }

    handleClick(id) {
        this.props.onClick && this.props.onClick(id);
    }

    componentDidUpdate(prevProps) {
        var preData = JSON.stringify(prevProps.data);
        var data = JSON.stringify(this.props.data);
        var preOptions = JSON.stringify(prevProps.options);
        var options = JSON.stringify(this.props.options);
        if (!this.map || preData !== data || preOptions !== options) {
            this.initialize();
        }
    }

    initialize() {

        let map = this.props.map;
        if (!map) {
            return;
        }
        this.map = map;

        if (!this._createLayer) {
            this.createLayers();
        }

        if (this.props.options.autoViewport) {
            let projection = map.getMapType().getProjection();
            let getPoint = coordinate => {
                if (this.props.options.coordType === 'bd09mc') {
                    return projection.pointToLngLat(new BMap.Pixel(coordinate[0], coordinate[1]));
                } else {
                    return new BMap.Point(coordinate[0], coordinate[1]);
                }
            }

            let points = [];

            this.props.data.map(item => {
                if (item.geometry.type === 'Point') {
                    points.push(getPoint(item.geometry.coordinates));
                } else if (item.geometry.type === 'LineString') {
                    item.geometry.coordinates.map(item => {
                        points.push(getPoint(item));
                    });
                } else if (item.geometry.type === 'Polygon') {
                    item.geometry.coordinates[0].map(item => {
                        points.push(getPoint(item));
                    });
                }
            });

            if (points.length > 0) {
                map.setViewport(points, this.props.options.viewportOptions);
            }
        }

        this.layer.setData(this.props.data);
        this.layer.setOptions(this.props.options)
    }


    createLayers() {
        if (mapvgl[this.props.type]) {
            this._createLayer = true;
            this.layer = new mapvgl[this.props.type](this.props.options);
            this.props.view.addLayer(this.layer);
        } else {
            console.error(`mapvgl doesn't have layer ${this.props.type}!`)
        }
    }

}
