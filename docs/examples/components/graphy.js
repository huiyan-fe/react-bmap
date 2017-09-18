import React, { Component } from 'react';
import {Map, Circle, Polyline, Polygon} from '../../../src';
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map mapStyle={simpleMapStyle} center={{lng: 116.403119, lat: 39.929543}} zoom="12">
            <Circle 
                center={{lng: 116.403119, lat: 39.929543}} 
                fillColor='blue' 
                strokeColor='white' 
                radius="3000"
            />
            <Polyline 
                strokeColor='green' 
                path={[
                    {lng: 116.403119, lat: 39.929543},
                    {lng: 116.265139, lat: 39.978658},
                    {lng: 116.217996, lat: 39.904309}
                ]}
            />
            <Polygon 
                fillColor='red' 
                strokeColor='yellow' 
                autoViewport={false} 
                path={[
                    {lng: 116.442519, lat: 39.945597},
                    {lng: 116.484488, lat: 39.905315},
                    {lng: 116.443094, lat: 39.886494},
                    {lng: 116.426709, lat: 39.900001}
                ]}
            />
        </Map>
    }
}

