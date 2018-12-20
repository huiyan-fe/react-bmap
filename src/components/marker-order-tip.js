import React from 'react';
import Marker from './marker';
import { bmap as _bmap, obj } from 'kits-js';

class MarkerOrderTip extends React.Component {
    constructor(args) {
        super(args);
        this.createMarker = this.createMarker.bind(this);
        this.state = {};
    }

    static get defaultProps() {
        return {
            autoViewport: true
        }
    }

    componentDidUpdate(prevProps) {
        var preData = JSON.stringify(prevProps.data);
        var data = JSON.stringify(this.props.data);
        if (preData != data || !this.map) {
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() { }

    createMarker() {
        const self = this;
        let { position, num, rate, name, rightModule, order, visible = true } = this.props;
        let point = _bmap.createPoint(position);
        let up = true;
        if (rate) {
            if (rate.indexOf('-') > -1) {
                up = false;
                rate = rate.replace(/-/, '');
            }
            if (rate.indexOf('+') > -1) {
                up = true;
                rate = rate.replace('+', '');
            }
            if (rate.length == 0) {
                rate = '_';
            }
        }

        let custom_overlay = {
            'display': 'flex',
            'justifyContent': 'space-between',
            'background': '#FFFFFF',
            'alignItems': 'stretch',
            'boxShadow': '0 2px 2px 0 rgba(0, 0, 0, 0.22)',
            'borderRadius': '3px 0 0 3px',
            'minWidth': '155px',
            'minHeight': '50px',
            'marginTop': '-25px',
        };

        let order_style = {
            minWidth: '30px',
            background: '#999999',
            color: 'white',
            padding: 'auto 0',
            display: 'flex',
            'justifyContent': 'center',
            'alignItems': 'center',
        };

        if (this.props.active) {
            order_style.background = '#F5533D'
        }
        if (this.props.leftStyle) {
            order_style = obj.merge(order_style, this.props.leftStyle);
        }
        if (this.props.style) {
            custom_overlay = obj.merge(custom_overlay, this.props.style);
        }

        let right_style = {
            flex: '1',
            padding: '6px',
            'justifyContent': 'center',
            'alignItems': 'center',
            'fontSize': '12px',
            color: '#8D93A3',
            'letterSpacing': '0.6px',
        }

        if (this.props.rightStyle) {
            right_style = obj.merge(right_style, this.props.rightStyle);
        }

        let eventKeys = Object.keys(self.props).filter(p => {
            return p.indexOf('on') == 0
        })
        let events = [];
        eventKeys.map(key => {
            events.push({
                [key]: self.props[key]
            });
        })

        if (visible) {
            return (
                <Marker
                    key={JSON.stringify(point) + Math.random()}
                    map={this.props.map}
                    position={point}
                // offset={new BMap.Size(-75, -60)}
                >
                    <div
                        key={JSON.stringify(point) + Math.random()}
                        style={custom_overlay}
                        {...events}
                    >
                        <div style={order_style}>{order}</div>
                        <div style={right_style}>
                            {!rightModule && <div>  {`${num}(${rate}`}
                                {
                                    up
                                        ? < img
                                            style={{
                                                width: '8px',
                                                height: 'auto',
                                                margin: '1px',
                                            }}
                                            src='//huiyan.baidu.com/cms/react-bmap/up.png'
                                        />
                                        : < img
                                            style={{
                                                width: '8px',
                                                height: 'auto',
                                                margin: '1px',
                                            }}
                                            src='//huiyan.baidu.com/cms/react-bmap/down.png'
                                        />
                                }
                                {')'}
                            </div>}
                            {rightModule
                                ? rightModule 
                                : <div>  {name} </div>
                            }
                        </div>
                    </div>
                </Marker>
            );
        }
    }

    render() {
        let self = this;
        let marker = this.createMarker();
        return marker;
    }
}
// MarkerOrderTip.defaultProps = {
//     name: '无文字',
//     rate: '_',
//     order: 0,
//     num: 0,
//     visible: true,
//     position:[89.430831,32.511366],
//     rightModule:<dom/>,
// }
export default MarkerOrderTip;