/**
 * @file 基础组件对象
 * @author kyle(hinikai@gmail.com)
 */
import {Component} from 'react';

export default class App extends Component {
    constructor(args) {
        super(args);
    }

    /**
     * 给某个对象绑定对应需要的事件
     * @param 需要绑定事件的对象
     * @param 事件名数组
     * @return null;
     */
    bindEvent(obj, events) {
        var self = this;
        if (events) {
            events.forEach((event) => {
                obj.addEventListener(event, function () {
                    self.props.events && self.props.events[event] && self.props.events[event].apply(self, arguments);
                });
            });
        }
    }

    /**
     * 给某个对象绑定需要切换的属性对应的方法
     * @param 需要绑定属性的对象
     * @param 属性和对应的2个切换方法
     * @return null;
     */
    bindToggleMeghods(obj, toggleMethods) {
        for (var key in toggleMethods) {
            if (this.props[key] !== undefined) {
                if (this.props[key]) {
                    obj[toggleMethods[key][0]](); 
                } else {
                    obj[toggleMethods[key][1]]();
                }
            }
        }
    }

    getOptions(options) {
        var result = {};
        options.map((key) => {
            if (this.props[key] !== undefined) {
                result[key] = this.props[key];
            }
        });
        return result;
    }

    render() {
        return null;
    }
}
