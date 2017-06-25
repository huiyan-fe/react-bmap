import Component from './component';

export default class App extends Component {
    constructor(args) {
        super(args);
        this.state = {
        };
    }

    static get defaultProps() {
        return {
            autoViewport: true
        }
    }

    componentDidUpdate(prevProps) {
        this.initialize();
    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        if (this.pointLayer) {
            this.pointLayer.destroy();
            this.pointLayer = null;
        }
        if (this.textLayer) {
            this.textLayer.destroy();
            this.textLayer = null;
        }

        if (this.numberLayer) {
            this.numberLayer.destroy();
            this.numberLayer = null;
        }
    }

    initialize() {
        var self = this;
        var map = this.props.map;
        if (!map) {
            return;
        }

        if (!this.pointLayer) {
            this.dataSet = new mapv.DataSet([]);

            var options = this.props.textOptions || {
                fillStyle: '#6c6c6c',
                globalAlpha: '0.9',
                textAlign: 'left',
                offset: {
                    x: 15,
                    y: 0
                },
                avoid: true,
                size: 12,
                textKey: 'text',
                draw: 'text'
            }

            this.textLayer = new mapv.baiduMapLayer(map, this.dataSet, options);

            var options = this.props.pointOptions || {
                fillStyle: 'red',
                size: 12,
                draw: 'simple'
            }

            options.methods = options.methods || {};
            options.methods.mousemove =  function(item) {
                self.dataSet.update(function(item) {
                    item.fillStyle = null;
                });
                if (item) {
                    self.dataSet.update(function(item) {
                        item.fillStyle = '#1495ff';
                    }, {
                        number: item.number
                    });
                }
            }

            this.pointLayer = new mapv.baiduMapLayer(map, this.dataSet, options);


            var options = {
                fillStyle: 'white',
                size: 12,
                textKey: 'number',
                draw: 'text'
            }
            this.numberLayer = new mapv.baiduMapLayer(map, this.dataSet, options);
        }

        var data = this.props.data;
        var points = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].location) {
                var location = data[i].location.split(',');
                points.push(new BMap.Point(location[0], location[1]));
                data[i].geometry = {
                    type: 'Point',
                    coordinates: [location[0], location[1]]
                };
                data[i].number = i + 1;
            }
        }
        this.dataSet.set(data);
        if (points.length > 0 && this.props.autoViewport !== false) {
            map.setViewport(points, self.props.viewportOptions);
        }
    }

    render() {
        return null;
    }
}
