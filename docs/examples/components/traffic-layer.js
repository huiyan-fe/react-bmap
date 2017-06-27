import React, { Component } from 'react';
import {Map, TrafficLayer} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map mapStyle={simpleMapStyle} center={{lng: 116.402544, lat: 39.928658}} zoom={11}>
            <TrafficLayer/>
        </Map>
    }
}

