# react-bmap [![npm version](https://img.shields.io/npm/v/react-bmap.svg)](https://www.npmjs.com/package/react-bmap)
基于百度地图api封装的React组件库

## 示例
可查看示例文件夹下的示例使用[示例代码](https://github.com/huiyan-fe/react-bmap/tree/master/docs/examples)，示例效果可访问[预览地址](https://huiyan-fe.github.io/react-bmap/examples/)

## 安装使用

### 使用npm方式安装使用

    npm install react-bmap

## Hello World
    import {Map,Marker,NavigationControl,InfoWindow} from 'react-bmap'

    <Map center={{lng: 116.402544, lat: 39.928216}}>
        <Marker position={{lng: 116.402544, lat: 39.928216}} />
        <NavigationControl /> 
        <InfoWindow position={{lng: 116.402544, lat: 39.928216}} text="内容" title="标题"/>
    </Map>
    
## 基础地图组件文档
- [Map](./src/components/map.md)
    <Map center={{lng: 116.402544, lat: 39.928216}} zoom="12" />
- [Marker](./src/components/marker.md)
    <Marker position={{lng: 116.402544, lat: 39.928216}}/>
- [Control](./src/components/control.md)
    <NavigationControl />
    <MapTypeControl />
    <ScaleControl />
    <OverviewMapControl />
- [InfoWindow](./src/components/infowindow.md)
    <InfoWindow position={{lng: 116.402544, lat: 39.928216}}/>
### 图形覆盖物，圆形、折线、多边形
- Circle
    <Circle 
        center={{lng: 116.403119, lat: 39.929543}} 
        fillColor='blue' 
        strokeColor='white' 
        radius="3000"
    />
- Polyline
    <Polyline 
        strokeColor='green' 
        path={[
            {lng: 116.403119, lat: 39.929543},
            {lng: 116.265139, lat: 39.978658},
            {lng: 116.217996, lat: 39.904309}
        ]}
    />
- Polygon
    <Polygon 
        fillColor='red' 
        strokeColor='yellow' 
        path={[
            {lng: 116.442519, lat: 39.945597},
            {lng: 116.484488, lat: 39.905315},
            {lng: 116.443094, lat: 39.886494},
            {lng: 116.426709, lat: 39.900001}
        ]}
    />
## 其它一些场景组件
    <MapvLayer data={[]} options={{}} />

## 许可证
[MIT](./LICENSE)
