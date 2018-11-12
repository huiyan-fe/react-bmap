/**
 * @file 给地图添加监听事件
 * @author hedongran
 */
import React from 'react';

/**
 * 防抖函数
 * @param method 事件触发的操作
 * @param delay 多少毫秒内连续触发事件，不会执行
 * @returns {Function}
 */
function debounce(method, delay) {
    let timer = null;
    return function () {
        let self = this,
            args = arguments;
        timer && clearTimeout(timer);
        timer = setTimeout(function () {
            method.apply(self, args);
        }, delay);
    }
}

/**
 * 节流函数
 * @param method 事件触发的操作
 * @param mustRunDelay 间隔多少毫秒需要触发一次事件
 * @returns {Function}
 */
function throttle(method, mustRunDelay) {
    let timer,
        args = arguments,
        start;
    return function loop() {
        let self = this;
        let now = Date.now();
        if(!start){
            start = now;
        }
        if(timer){
            clearTimeout(timer);
        }
        if(now - start >= mustRunDelay){
            method.apply(self, args);
            start = now;
        }else {
            timer = setTimeout(function () {
                loop.apply(self, args);
            }, 50);
        }
    }
}

export default class MapListener extends React.Component {
    constructor(props) {
        super(props);

        this.map = this.props.map;
    }

    /**
     * 设置默认的props属性
     */
    static get defaultProps() {
        return {
            eventType: 'debounce',   // debounce防抖, throttle节流, direct直接执行
            delay: 500
        }
    };

    componentDidMount() {
        if (this.props.onZoomend) {
            this._bindZoomendEvent();
        }
        if (this.props.onDragend) {
            this._bindDragendEvent();
        }
    }

    componentWillUnmount() {
        const map = this.map;
        if (this.props.onZoomend) {
            map.removeEventListener('zoomend', this.onZoomend);
        }
        if (this.props.onDragend) {
            map.removeEventListener('dragend', this.onDragend);
        }
    }

    _bindZoomendEvent() {
        const map = this.map;
        const {onZoomend:fn, eventType, delay} = this.props;
        if (eventType === 'debounce') {
            this.onZoomend = debounce(fn, delay);
        } else if (eventType === 'throttle') {
            this.onZoomend = throttle(fn, delay);
        } else {
            this.onZoomend = fn;
        }
        map.addEventListener('zoomend', this.onZoomend);
    }

    _bindDragendEvent() {
        const map = this.map;
        const {onDragend:fn, eventType, delay} = this.props;
        if (eventType === 'debounce') {
            this.onDragend = debounce(fn, delay);
        } else if (eventType === 'throttle') {
            this.onDragend = throttle(fn, delay);
        } else {
            this.onDragend = fn;
        }
        map.addEventListener('dragend', this.onDragend);
    }

    render() {
        return null;
    }
}
