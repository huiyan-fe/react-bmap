/**
 * @file 交通路况图层组件
 * @author kyle(hinikai@gmail.com)
 */

import Component from './component';

export default class App extends Component {

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
        this.props.map.removeTileLayer(this.tileLayer);
        this.tileLayer = null;
    }

    initialize() {
        var map = this.props.map;
        if (!map) {
            return;
        }

        if (!this.tileLayer) {
            this.tileLayer = new BMap.TileLayer({
                isTransparentPng: true
            });
            let scaler = Math.round(window.devicePixelRatio || 1);
            scaler = Math.min(2, scaler);
            scaler = Math.max(1, scaler);
            this.tileLayer.getTilesUrl = (tileCoord, zoom) => {
                const x = tileCoord.x;
                const y = tileCoord.y;
                const time = new Date().getTime();
                return 'http://its.map.baidu.com:8002/traffic/TrafficTileService?level=' + zoom + '&x=' + x + '&y=' + y + '&time=' + time + '&v=081&scaler=' + scaler; // 根据当前坐标，选取合适的瓦片图
            };
        }
        map.addTileLayer(this.tileLayer);
    }

}
