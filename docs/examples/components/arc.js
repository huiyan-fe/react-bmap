import React, { Component } from 'react';
import {Map, Arc, Marker} from '../../../src';
import {utilCityCenter} from 'mapv';
import {simpleMapStyle} from './mapstyle';

export default class App extends Component {
    render() {
        var center = utilCityCenter.getCenterByCityName('北京');
        var icon = new BMap.Icon('http://wiki.lbsyun.baidu.com/cms/images/huiyan_od_marker.png', new BMap.Size(66 / 2, 82 / 2), {
            imageSize: new BMap.Size(66 / 2, 82 / 2),
            anchor: new BMap.Size(66 / 2 / 2, 82 / 2 - 10)
        });
        return <Map style={{height: '400px'}} mapStyle={simpleMapStyle} center={{lng: 105.403119, lat: 38.328658}} zoom='13'>
            <Arc options={{
                showFromPoint: false,
                showToPoint: true
            }} data={[
                {
                    from: {
                        name: '北京'
                    },
                    to: {
                        name: '南京'
                    }
                },
                {
                    from: {
                        name: '北京',
                    },
                    to: {
                        point: {
                            lng: 101.45934,
                            lat: 39.135305
                        }
                    }
                },
                {
                    from: {
                        name: '北京'
                    },
                    to: {
                        name: '成都'
                    }
                },
                {
                    from: {
                        name: '北京'
                    },
                    to: {
                        name: '广州'
                    }
                }
            ]} />
            <Marker icon={icon} position={center} />
        </Map>
    }
}

