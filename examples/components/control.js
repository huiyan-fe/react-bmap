import React, { Component } from 'react';
import {Map, NavigationControl, MapTypeControl, ScaleControl, OverviewMapControl} from '../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map mapStyle={simpleMapStyle}>
            <NavigationControl />
            <MapTypeControl />
            <ScaleControl />
            <OverviewMapControl />
        </Map>
    }
}

