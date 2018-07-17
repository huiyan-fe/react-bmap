import React, { Component } from 'react';
import {Map, Marker} from '../../../src'
import {simpleMapStyle} from './mapstyle'

var points = [
    {
        lng: 116.402544,
        lat: 39.928216
    },
    {
        lng: 119.0874,
        lat: 36.665582
    },
    {
        lng: 112.538537,
        lat: 37.874899
    },
    {
        lng: 114.501011,
        lat: 33.920864
    },
    {
        lng: 109.210063,
        lat: 34.339622
    },
    {
        lng: 99.430831,
        lat: 38.211366
    },
    {
        lng: 89.430831,
        lat: 33.311366
    },
    {
        lng: 99.430831,
        lat: 32.511366
    },
    {
        lng: 79.430831,
        lat: 35.611366
    },
    {
        lng: 83.430831,
        lat: 39.711366
    },
];

export default class App extends Component {
    toFixedNum(num, s) {
        var times = Math.pow(10, s)
        var des = num * times + 0.5
        des = parseInt(des, 10) / times
        console.log(des);
        return des + ''
    }
    render() {
        return  <Map center = {{
                lng: 105.403119,
                lat: 38.028658
            }}
            key={'marker-order-tip'}
            zoom = '5' 
            mapStyle={simpleMapStyle}>
            {points.map((position, index) => {
                let order = index+1;
                let updown = index/2 ? '-':'';
                let ran = Math.random()*100;
                let rn = this.toFixedNum(ran,2);
                let rate=  updown + rn +'%'
                let num = rn;
                let name = '测试'+order;
                return <Marker 
                    key={order}
                    type={'info_tip'}
                    map={this.props.map} 
                    // rightModule={<div>hello</div>}
                    position={position} 
                    name={name} 
                    num={num} 
                    rate={rate} 
                    order={order} 
                />
            })}
        </Map>
    }
}

