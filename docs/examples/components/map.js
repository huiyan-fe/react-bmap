import React, {Component} from 'react';
import {simpleMapStyle} from './mapstyle'
import {Map} from '../../../src'

export default class App extends Component {
    getEvents() {
        return {
            click: () => {
                console.log('map click event');
            }
        }
    }

    render() {
        return <Map 
            mapStyle={simpleMapStyle} // 个性化底图配置
            events={this.getEvents()} // 为地图添加各类监听事件
        />;
    }
}

