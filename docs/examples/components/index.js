import Map from './map';
import Marker from './marker';
import TrafficLayer from './traffic-layer';
import InfoWindow from './infowindow';
import Graphy from './graphy';
import MarkerList from './marker-list';
import MapvLayer from './mapv-layer';
import MapvMarkerList from './mapv-marker-list';
import Road from './road';
import Boundary from './boundary';
import Control from './control';
import React from 'react';
import {render} from 'react-dom';

const examples = (
  <div>
    <h1>React-BMap 示例</h1>
    <h2>简单地图 Map <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/map.js">示例代码</a></h2>
    <Map />
    <h2>标注 Marker <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/marker.js">示例代码</a></h2>
    <Marker />
    <h2>信息窗口 InfoWindow <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/infowindow.js">示例代码</a></h2>
    <InfoWindow />
    <h2>各类地图控件 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/control.js">示例代码</a></h2>
    <Control />
    <h2>图形覆盖物 Circle Polyline Polygon <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/graphy.js">示例代码</a></h2>
    <Graphy />
    <h2>Mapv图层 MapvLayer <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/mapv-layer.js">示例代码</a></h2>
    <MapvLayer/>
    <h2>标注列表 MarkerList <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/marker-list.js">示例代码</a></h2>
    <MarkerList />
    <h2>道路 Road <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/road.js">示例代码</a></h2>
    <Road />
    <h2>行政区划 Boundary <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/boundary.js">示例代码</a></h2>
    <Boundary />
    <h2>交通路况图层 TrafficLayer <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/traffic-layer.js">示例代码</a></h2>
    <TrafficLayer />
  </div>
)

render(examples, document.getElementById('app'))
