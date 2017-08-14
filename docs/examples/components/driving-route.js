import React, { Component } from 'react';
import {Map, DrivingRoute} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <div>
        {/*
        <Map style={{height: '200px'}} mapStyle={simpleMapStyle} center={{lng: 116.403981, lat: 39.915599}} zoom='10'>
            <DrivingRoute start={{
                lng: 116.320044,
                lat: 40.016023
            }} end={{
                lng: 116.404556,
                lat: 39.915599
            }}/> 
        </Map>
        */}
        <Map style={{height: '200px'}} mapStyle={simpleMapStyle} center={{lng: 116.403981, lat: 39.915599}} zoom='10'>
            <DrivingRoute start='天安门' end='百度大厦'/> 
        </Map>
        </div>
    }
}

