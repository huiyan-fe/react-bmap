import React, { Component } from 'react';
import {Map, InfoWindow} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map center = {{
                    lng: 105.403119,
                    lat: 38.028658
                }}
                zoom = '5' 
                mapStyle={simpleMapStyle}>
            <InfoWindow position={{lng: 116.402544, lat: 39.928216}} text="内容" title="标题"/>
        </Map>
    }
}

