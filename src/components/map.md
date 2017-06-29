# Map
最外层地图基础组件，其它组件都在包含在地图组件里面。对应的一些属性也可以查看官方文档对应的[Map对象](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a0b0)

## 可配置属性
* center={{lng: 123, lat}}
* zoom={{10}}
* style={{height: '300px'}} css样式对象
* mapStyle={{styleJson: []}} 个性化底图json样式可以通过[底图编辑器](http://wiki.lbsyun.baidu.com/custom/)配置
* minZoom='3'
* maxZoom='19'

* enableMapClick={false}
* enableScrollWheelZoom={false}
* enableDragging={false}
* enableDoubleClickZoom={false}
* enableKeyboard={false}
* enableInertialDragging={false}
* enableContinuousZoom={false}
* enablePinchToZoom={false}
* enableAutoResize={false}
* events={事件options}

### map的事件options包含以下属性：
* click
* dblclick
* rightclick
* rightdblclick
* maptypechange
* mousemove
* mouseover
* mouseout
* movestart
* moving
* moveend
* zoomstart
* zoomend
* addoverlay
* addcontrol
* removecontrol
* removeoverlay
* clearoverlays
* dragstart
* dragging
* dragend
* addtilelayer
* removetilelayer
* load
* resize
* hotspotclick
* hotspotover
* hotspotout
* tilesloaded
* touchstart
* touchmove
* touchend
* longpress
