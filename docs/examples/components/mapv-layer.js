import React, { Component } from 'react';
import {Map, MapvLayer} from '../../../src';
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map mapStyle={simpleMapStyle}>
            <MapvLayer data={[
                {
                    geometry: {
                        type: 'Point',
                        coordinates: [123, 23]
                    },
                    count: 30 * Math.random()
                }
            ]} options={{
                fillStyle: 'rgba(255, 50, 50, 0.6)',
                shadowColor: 'rgba(255, 50, 50, 1)',
                shadowBlur: 30,
                globalCompositeOperation: 'lighter',
                size: 5,
                draw: 'simple'
            }} />
        </Map>
    }
}

