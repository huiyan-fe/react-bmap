import Simple from './simple';
import Marker from './marker';
import TrafficLayer from './traffic-layer';
import InfoWindow from './infowindow';
import MarkerList from './marker-list';
import Road from './road';
import Boundary from './boundary';
import Control from './control';
import React from 'react';
import { render } from 'react-dom';

const examples = (
  <div>
    <h1>React-BMap 示例</h1>
    <h2>简单地图</h2>
    <Simple />
    <h2>标注</h2>
    <Marker />
    <h2>信息窗口</h2>
    <InfoWindow />
    <h2>控件</h2>
    <Control />
    <h2>图标</h2>
    <MarkerList />
    <h2>道路</h2>
    <Road />
    <h2>行政区划</h2>
    <Boundary />
    <h2>交通路况图层</h2>
    <TrafficLayer />
  </div>
)

render(examples, document.getElementById('app'))
