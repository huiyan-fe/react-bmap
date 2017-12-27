import Map from './map';
import Marker from './marker';
import PointLabel from './point-label';
import TrafficLayer from './traffic-layer';
import InfoWindow from './infowindow';
import Graphy from './graphy';
import MarkerList from './marker-list';
import MapvLayer from './mapv-layer';
import MapvMarkerList from './mapv-marker-list';
import Road from './road';
import Arc from './arc';
import Boundary from './boundary';
import Control from './control';
import DrivingRoute from './driving-route';
import React from 'react';
import {render} from 'react-dom';

const examples = (
  <div>
    <h1>React-BMap 示例</h1>
    <h2>Map 简单地图 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/map.js">示例代码</a></h2>
    <Map />
    <h2>Marker 标注 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/marker.js">示例代码</a></h2>
    <Marker />
    <h2>InfoWindow 信息窗口 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/infowindow.js">示例代码</a></h2>
    <InfoWindow />
    <h2>各类地图控件 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/control.js">示例代码</a></h2>
    <Control />
    <h2>图形覆盖物 Circle Polyline Polygon <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/graphy.js">示例代码</a></h2>
    <Graphy />
    <h2>MapvLayer Mapv图层 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/mapv-layer.js">示例代码</a></h2>
    <MapvLayer/>
    <h2>MarkerList 标注列表 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/marker-list.js">示例代码</a></h2>
    <MarkerList />
    <h2>Road 道路 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/road.js">示例代码</a></h2>
    <Road />
    <h2>Boundary 行政区划 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/boundary.js">示例代码</a></h2>
    <Boundary />
    <h2>TrafficLayer 交通路况图层 <a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/traffic-layer.js">示例代码</a></h2>
    <TrafficLayer />
    <h2>驾车组件<a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/driving-route.js">示例代码</a></h2>
    <DrivingRoute />
    <h2>PointLabel<a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/point-label.js">示例代码</a></h2>
    <PointLabel />
    <h2>Arc<a href="https://github.com/huiyan-fe/react-bmap/blob/master/docs/examples/components/arc.js">示例代码</a></h2>
    <Arc />
  </div>
)

render(examples, document.getElementById('app'))
