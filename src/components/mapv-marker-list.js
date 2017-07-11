import Component from './component';
import {DataSet, baiduMapLayer, baiduMapAnimationLayer} from 'mapv';

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

        this.showDatasets(this.props.data);
        
    }

    componentDidMount() {
        this.initialize();
    }

    componentWillUnmount() {
        
        this.shadowSet = null;
        this.circleSet = null;
        this.textSet = null;
        this.numSet = null;
        this.otherSet = null;
        this.otherShadowSet = null;

        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].destroy();
            this.layers[i] = null;
        }

    }

    showDatasets(list) {

        let shadowData = [];
        let circleData = [];
        let textData = [];
        let otherData = [];
        let otherShadowData = [];
        let overViews = [];

        if (list.length > 0) {
            
            list.forEach((item, key) => {
                let cityCenter = item['location'].split(',');
                let p = this.project.pointToLngLat(new BMap.Pixel(cityCenter[0], cityCenter[1])) 
                overViews.push(p);
                if (key < 10) {
                    shadowData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [cityCenter[0], cityCenter[1]]
                        },
                        count: parseInt(item['count'])
                    });
                    circleData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [cityCenter[0], cityCenter[1]]
                        },
                        id: key,
                        count: parseInt(item['count']),
                        text: parseInt(key) + 1
                    });
                    textData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [cityCenter[0], cityCenter[1]]
                        },
                        count: parseInt(item['count']),
                        text: item['text']
                    });
                } else {
                    otherData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [cityCenter[0], cityCenter[1]]
                        },
                        id: key,
                        count: parseInt(item['count']),
                    });
                    otherShadowData.push({
                        geometry: {
                            type: 'Point',
                            coordinates: [cityCenter[0], cityCenter[1]]
                        },
                        count: parseInt(item['count'])
                    });
                }
            });
            this.shadowSet.set(shadowData);
            this.circleSet.set(circleData);
            this.textSet.set(textData);
            this.numSet.set(circleData);
            this.otherSet.set(otherData);
            this.otherShadowSet.set(otherShadowData);
            if (overViews.length > 0 && this.props.autoViewport !== false) {
                map.setViewport(overViews, self.props.viewportOptions);
            }
        }
    }
    
    createLayers() {
        this._createLayer = true;
        var map = this.map;
        this.project = map.getMapType().getProjection();

        let self = this;
        let shadowSet = this.shadowSet = new DataSet([]);
        let circleSet = this.circleSet =  new DataSet([]);
        let textSet = this.textSet = new DataSet([]);
        let numSet = this.numSet = new DataSet([]);
        let otherSet = this.otherSet = new DataSet([]);
        let otherShadowSet = this.otherShadowSet = new DataSet([]);
        this.layers = [];

        let otherOptions = {
            coordType: 'bd09mc',
            splitList: {
                4: '#d53938',
                3: '#fe6261',
                2: '#ffb02d',
                other: '#80db69'
            },
            shadowBlur: 10,
            size: 5,
            max: 30,
            methods: {
                click: function (item) {
                    if (item) {
                        self.handleClick(item.id); 
                    }
                },
                mousemove: function(item) {
                    otherSet.update(function(item) {
                        item.fillStyle = null;
                    });
                    if (item) {
                        self.isSmallPath = true;
                        self.props.map.setDefaultCursor('pointer');
                        otherSet.update(function(item) {
                            item.fillStyle = '#1495ff';
                        }, {
                            id: item.id
                        });
                    } else {
                        self.isSmallPath = false;
                        if(!self.isSmallPath && !self.isBigPath) {
                            self.props.map.setDefaultCursor('auto');
                        }
                    }
                }

            },
            draw: 'category'
        };

        let otherShadowOptions = {
            splitList: {
                4: '#d53938',
                3: '#fe6261',
                2: '#ffb02d',
                1: '#80db69'
            },
            styleType: 'fill',
            globalAlpha: 0.4,
            coordType: 'bd09mc',
            size: 8,
            minSize: 5,
            draw: 'category'
        };
        this.layers.push(new baiduMapLayer(map, otherShadowSet, otherShadowOptions));
        
        this.layers.push(new baiduMapLayer(map, otherSet, otherOptions));

        if (this.props.animation === true) {
            let shadowOptions = {
                splitList: {
                    4: '#d53938',
                    3: '#fe6261',
                    2: '#ffb02d',
                    1: '#80db69'
                },
                styleType: 'stroke',
                globalAlpha: 0.4,
                coordType: 'bd09mc',
                size: 20,
                minSize: 10,
                draw: 'category'
            };
            this.layers.push(new baiduMapAnimationLayer(map, shadowSet, shadowOptions));
        }

        let circleOptions = {
            splitList: {
                1: '#80db69',
                4: '#d53938',
                3: '#fe6261',
                2: '#ffb02d'
            },
            fillStyle: 'red',
            coordType: 'bd09mc',
            size: 10,
            draw: 'category',
            methods: {
                click: function (item) {
                    if (item) {
                        self.handleClick(item.id); 
                    }
                },
                mousemove: function(item) {
                    circleSet.update(function(item) {
                        item.fillStyle = null;
                    });
                    if (item) {
                        self.isBigPath = true;
                        self.map.setDefaultCursor('pointer');
                        circleSet.update(function(item) {
                            item.fillStyle = '#1495ff';
                        }, {
                            id: item.id
                        });
                    } else {
                        self.isBigPath = false;
                        if (!self.isBigPath && !self.isSmallPath) {
                            self.map.setDefaultCursor('auto');
                        }
                    }
                }
            },
        };
        this.layers.push(new baiduMapLayer(map, circleSet, circleOptions));

        let numOptions = {
            coordType: 'bd09mc',
            draw: 'text',
            font: '13px Arial',
            fillStyle: '#ffffff',
            shadowColor: '#ffffff',
            shadowBlur: 10
        }
        this.layers.push(new baiduMapLayer(map, numSet, numOptions));


        let textOptions = {
            coordType: 'bd09mc',
            font: '13px Arial',
            fillStyle: '#666',
            shadowColor: '#ffffff',
            shadowBlur: 10,

            draw: 'text',
            avoid: true,
            textAlign: 'left',
            offset: {
                x: 10,
                y: 0
            }
        }
        this.layers.push(new baiduMapLayer(map, textSet, textOptions));

    }

    render() {
        return null;
    }
}
