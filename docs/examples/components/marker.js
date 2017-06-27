import React, { Component } from 'react';
import {Map, Marker} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map mapStyle={simpleMapStyle}>
            <Marker 
                position={{lng: 116.402544, lat: 39.928216}} 
                events={{
                    click: () => {
                        console.log('marker click event');
                    }
                }}
            />
        </Map>
    }
}

