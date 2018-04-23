# 地图控件组件

    import {Map, NavigationControl, MapTypeControl, ScaleControl, OverviewMapControl} from '../../../src'

    <Map mapStyle={simpleMapStyle}>
        <NavigationControl />
        <MapTypeControl />
        <ScaleControl />
        <OverviewMapControl />
        <PanoramaControl anchor={BMAP_ANCHOR_TOP_RIGHT} offset={new BMap.Size(10, 40)}/ >
    </Map>
    
## NavigationControl 
### 可配置属性 [参考官网](http://lbsyun.baidu.com/cms/jsapi/class/jsapi_reference.html#a2b3)
- anchor
- offset
- type
- showZoomInfo
- enableGeolocation

## MapTypeControl
### 可配置属性 [参考官网](http://lbsyun.baidu.com/cms/jsapi/class/jsapi_reference.html#a2b16)
- anchor
- offset
- type
- mapTypes

## ScaleControl
### 可配置属性 [参考官网](http://lbsyun.baidu.com/cms/jsapi/class/jsapi_reference.html#a2b10)
- anchor
- offset

## OverviewMapControl
### 可配置属性 [参考官网](http://lbsyun.baidu.com/cms/jsapi/class/jsapi_reference.html#a2b8)
- anchor
- offset
- size
- isOpen

## PanoramaControl
### 可配置属性 [参考官网](http://lbsyun.baidu.com/cms/jsapi/class/jsapi_reference.html#a2b18)
- anchor
- offset
