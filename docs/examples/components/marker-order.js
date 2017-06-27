import React, {Component} from 'react';
import {Map, MarkerOrder} from '../../../src'
import {simpleMapStyle} from './mapstyle'

var markerData = [
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "长沙大道-13",
        semantic: "从腾飞路到京深线",
        speed: "64.66",
        yongdu_length: 1,
        length: "19.78",
        yongdu_index: "1.17",
        road_type: "1",
        roadname: "长沙大道",
        text: "长沙大道",
        location: "113.22183,28.191712"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "机场高速-0",
        semantic: "机场高速",
        speed: "73.85",
        yongdu_length: 1,
        length: "15.91",
        yongdu_index: "1.16",
        road_type: "1",
        roadname: "机场高速",
        text: "机场高速",
        location: "113.057565,28.175208"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "梅溪湖隧道-1",
        semantic: "从梅溪湖隧道到G0401长沙绕城高速",
        speed: "65.06",
        yongdu_length: 1,
        length: "3.30",
        yongdu_index: "1.15",
        road_type: "1",
        roadname: "梅溪湖隧道",
        text: "梅溪湖隧道",
        location: "112.892215,28.176181"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "长沙大道-0",
        semantic: "从京深线到腾飞路",
        speed: "67.64",
        yongdu_length: 1,
        length: "19.82",
        yongdu_index: "1.14",
        road_type: "1",
        roadname: "长沙大道",
        text: "长沙大道",
        location: "113.022513,28.175952"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "机场高速-1",
        semantic: "机场高速",
        speed: "75.32",
        yongdu_length: 1,
        length: "15.91",
        yongdu_index: "1.13",
        road_type: "1",
        roadname: "机场高速",
        text: "机场高速",
        location: "113.217251,28.191288"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "长张高速-1",
        semantic: "长张高速",
        speed: "77.98",
        yongdu_length: 1,
        length: "31.24",
        yongdu_index: "1.10",
        road_type: "1",
        roadname: "长张高速",
        text: "长张高速",
        location: "112.861765,28.239533"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "浏阳河大桥-16",
        semantic: "浏阳河大桥",
        speed: "85.00",
        yongdu_length: 1,
        length: 1,
        yongdu_index: "1.09",
        road_type: "1",
        roadname: "浏阳河大桥",
        text: "浏阳河大桥",
        location: "113.118219,28.179502"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "三环线-1",
        semantic: "从干杉收费站到杨梓冲收费站",
        speed: "77.18",
        yongdu_length: 1,
        length: "75.12",
        yongdu_index: "1.09",
        road_type: "1",
        roadname: "三环线",
        text: "三环线",
        location: "113.184336,28.123098"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "长张高速-0",
        semantic: "长张高速",
        speed: "80.11",
        yongdu_length: 1,
        length: "31.26",
        yongdu_index: "1.09",
        road_type: "1",
        roadname: "长张高速",
        text: "长张高速",
        location: "112.566241,28.329692"
    },
    {
        time: "201704071345",
        citycode: "158",
        district_type: "1",
        roadsegid: "长沙绕城高速-1",
        semantic: "从三环线到杨梓冲收费站",
        speed: "77.18",
        yongdu_length: 1,
        length: "75.12",
        yongdu_index: "1.09",
        road_type: "1",
        roadname: "长沙绕城高速",
        text: "长沙绕城高速",
        location: "113.184336,28.123098"
    }
];

export default class App extends Component {
    render() {
        return <div>
            <Map mapStyle={simpleMapStyle}>
                <MarkerOrder data={markerData}/>
            </Map>
        </div>
    }
}

