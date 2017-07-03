import React, { Component } from 'react';
import {Map, Road} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map style={{height: '200px'}} mapStyle={simpleMapStyle} center={{lng: 105.403119, lat: 38.028658}} zoom='5'>
            <Road roadPath={['116.330484,40.031406,116.33124,40.029496,116.33124,40.029496']} />
        </Map>
    }
}

