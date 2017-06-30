# Marker
标注组建，可在地图上打标注。对应的一些属性也可以查看官方文档对应的[Marker对象](http://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a3b2)

## 可配置属性
- position={{lng: 123, lat: 23}}
- offset={new BMap.Size(10, 10)}
- icon={String|BMap.Icon} 可配置一些我们事先配置好的icon样式，'simple_red','simple_blue','loc_red','loc_blue','start','end', 'number1', 'number2', ``` 'number10',或者可以自定义icon
- enableClicking={false}
- raiseOnDrag={false}
- draggingCursor='default'
- rotation="30"
- shadow={BMap.Icon}
- title="鼠标移上来提示文本"
- enableMassClear={false}
- enableDragging={false}

### marker的事件options包含以下属性，可传回调函数：
- click 
- dblclick 
- mousedown
- mouseup
- mouseout
- mouseover
- remove
- infowindowclose
- infowindowopen
- dragstart
- dragging
- dragend
- rightclick
