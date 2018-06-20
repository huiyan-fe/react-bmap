# OD业务组件

    import {Map, Arc, ThickRay} from '../../../src'

    <Map mapStyle={simpleMapStyle}>
        <Arc 
            showFromPoint={false}
            showToPoint={true}
            data={data} 
        />
        <ThickRay 
            showFromPoint={false}
            showToPoint={true}
            data={data} 
        />
    </Map>
    
## Arc 迁徙弧线
### 可配置属性 API
| 属性 | 说明 | 可选值 | 默认值 |
| --- | --- | --- | --- |
| coordType | 坐标类型 | 墨卡托坐标`bd09mc` 百度地图坐标`bd09ll` | 百度地图坐标`bd09ll` |
| showFromPoint | 显示迁徙起点 | `true` `false` | `true` |
| showToPoint | 显示迁徙终点 | `true` `false` | `true` |
| autoViewport | 自动调整视野 | `true` `false` | `true` |
| enableAnimation | 开启动画效果 | `true` `false` | `false` |
| viewportOptions | 视野调整功能参数 | - | - |
| animationOptions | 动画效果参数 | - | - |
| lineOptions | 迁徙弧线样式参数 | - | - |
| pointOptions | 起点终点样式参数 | - | - |
| textOptions | 终点文字样式参数 | - | - |
| data | 迁徙数据 | - | - |

## ThickRay 迁徙射线
### 可配置属性 API
| 属性 | 说明 | 可选值 | 默认值 |
| --- | --- | --- | --- |
| coordType | 坐标类型 | 墨卡托坐标`bd09mc` 百度地图坐标`bd09ll` | 百度地图坐标`bd09ll` |
| showFromPoint | 显示迁徙起点 | `true` `false` | `true` |
| showToPoint | 显示迁徙终点 | `true` `false` | `true` |
| autoViewport | 自动调整视野 | `true` `false` | `true` |
| viewportOptions | 视野调整功能参数 | - | - |
| lineOptions | 迁徙弧线样式参数 | - | - |
| pointOptions | 起点终点样式参数 | - | - |
| textOptions | 终点文字样式参数 | - | - |
| min | 迁徙数据count最小值 | - | `0` |
| max | 迁徙数据count最大值 | - | `1000` |
| data | 迁徙数据 | - | - |

## 附：其他参数数据格式
### data 数组格式
```javascript
data = [
    {
        color: 'red',   // 可覆盖迁徙点&线样式颜色
        from: {
            city: '北京'
        },
        to: {
            city: '南京'
        },
        count: 245      // 迁徙数量，isRequired only in <ThickRay />
    },
    {
        from: {
            city: '北京'
        },
        to: {           // 可以按城市传数据，也可按坐标传数据
            name: '自定义地点名称',
            point: {
                lng: 101.45934,
                lat: 39.135305
            }
        },
        count: 6543
    }
]
```