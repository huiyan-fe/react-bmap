import React, { Component } from 'react';
import {Map, Road} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map mapStyle={simpleMapStyle}>
            <Road roadPath={['116.330484,40.031406,116.33124,40.029496,116.33124,40.029496']}/>
        </Map>
    }
}

