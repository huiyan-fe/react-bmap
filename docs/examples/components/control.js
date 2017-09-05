import React, { Component } from 'react';
import {Map, NavigationControl, MapTypeControl, ScaleControl, OverviewMapControl} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map center={{
                    lng: 105.403119,
                    lat: 38.028658
                }}
                zoom='5' 
                mapStyle={simpleMapStyle}>
            <NavigationControl />
            <MapTypeControl />
            <ScaleControl />
            <OverviewMapControl />
        </Map>
    }
}

