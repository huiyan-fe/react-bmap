import React, { Component } from 'react';
import {Map, ThickRay, Marker} from '../../../src';
import {utilCityCenter} from 'mapv';
import {simpleMapStyle} from './mapstyle';

export default class App extends Component {
    render() {
        var center = utilCityCenter.getCenterByCityName('北京');
        var icon = new BMap.Icon('//huiyan.baidu.com/cms/react-bmap/huiyan_od_marker.png', new BMap.Size(66 / 2, 82 / 2), {
            imageSize: new BMap.Size(66 / 2, 82 / 2),
            anchor: new BMap.Size(66 / 2 / 2, 82 / 2 - 10)
        });
        return <Map style={{height: '400px'}} mapStyle={simpleMapStyle} center={{lng: 105.403119, lat: 38.328658}} zoom='13'>
            <ThickRay 
                showFromPoint={false}
                showToPoint={true}
                type="curve"
                data={[
                {
                    color: 'red',
                    from: {
                        city: '北京'
                    },
                    to: {
                        city: '南京'
                    },
                    count: 10001
                },
                {
                    from: {
                        city: '南京'
                    },
                    to: {
                        city: '北京'
                    },
                    count: 401
                },
                {
                    from: {
                        city: '北京',
                    },
                    to: {
                        name: '哈哈',
                        point: {
                            lng: 101.45934,
                            lat: 39.135305
                        }
                    },
                    count: 1
                },
                {
                    from: {
                        city: '北京'
                    },
                    to: {
                        city: '成都'
                    },
                    count: 500
                },
                {
                    from: {
                        city: '北京'
                    },
                    to: {
                        city: '广州'
                    },
                    count: 20
                }
            ]} />
            <Marker icon={icon} position={center} />
        </Map>
    }
}

