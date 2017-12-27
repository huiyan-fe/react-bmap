import React, { Component } from 'react';
import {Map, Arc} from '../../../src'
import {simpleMapStyle} from './mapstyle'

export default class App extends Component {
    render() {
        return <Map style={{height: '400px'}} mapStyle={simpleMapStyle} center={{lng: 105.403119, lat: 33.328658}} zoom='5'>
            <Arc data={[
                {
                    from: {
                        name: '北京'
                    },
                    to: {
                        name: '南京'
                    }
                },
                {
                    from: {
                        name: '北京',
                    },
                    to: {
                        point: {
                            lng: 101.45934,
                            lat: 39.135305
                        }
                    }
                },
                {
                    from: {
                        name: '北京'
                    },
                    to: {
                        name: '成都'
                    }
                },
                {
                    from: {
                        name: '北京'
                    },
                    to: {
                        name: '广州'
                    }
                }
            ]} />
        </Map>
    }
}

