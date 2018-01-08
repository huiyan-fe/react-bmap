import React, {Component} from 'react';
import {simpleMapStyle} from './mapstyle';
import {Map} from '../../../src';

// 自定义组件
function CustomComponent(props) {
    console.log('获取map对象', props.map);
    return <div style={{position: 'absolute', left: '0', top: '0',  color: 'white'}}>自定义组件</div>;
}

export default class App extends Component {
    getEvents() {
        return {
            click: (e) => {
                console.log('map click event', e, type);
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
            render={(map)=>{
                return <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'red',
                }}>自定义render</div>
            }}
        >
            <CustomComponent />
        </Map>
    }
}

