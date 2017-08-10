import React, {Component} from 'react';
import {simpleMapStyle} from './mapstyle';
import {Map} from '../../../src';

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
            style={{height: '250px'}} 
            enableScrollWheelZoom={false} 
            center={{lng: '116.403981', lat: '39.927773'}} 
            zoom='13' 
            mapStyle={{style: 'midnight'}} // 个性化底图配置
            events={this.getEvents()} // 为地图添加各类监听事件
        />;
    }
}

