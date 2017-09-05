import React, {Component} from 'react';
import {Map, Boundary} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map center={{
                    lng: 105.403119,
                    lat: 38.028658
                }}
                zoom='5' 
                mapStyle={simpleMapStyle}>
            <Boundary data={[
                {
                    name: '海淀区',
                    count: Math.random() * 100
                },
                {
                    name: '朝阳区',
                    count: Math.random() * 100
                },
                {
                    name: '西城区',
                    count: Math.random() * 100
                },
                {
                    name: '东城区',
                    count: Math.random() * 100
                },
                {
                    name: '昌平区',
                    count: Math.random() * 100
                },
                {
                    name: '通州区',
                    count: Math.random() * 100
                },
                {
                    name: '顺义区',
                    count: Math.random() * 100
                },
                {
                    name: '丰台区',
                    count: Math.random() * 100
                },
                {
                    name: '石景山区',
                    count: Math.random() * 100
                },
                {
                    name: '门头沟区',
                    count: Math.random() * 100
                },
                {
                    name: '大兴区',
                    count: Math.random() * 100
                },
                {
                    name: '房山区',
                    count: Math.random() * 100
                }
            ]}/>
        </Map>
    }
}

