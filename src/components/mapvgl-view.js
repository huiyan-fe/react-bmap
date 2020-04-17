/**
 * @file mapvgl的view图层管理类
 * @author hedongran
 * @email hdr01@126.com
 */
import React from 'react';
import Component from './component';
import {View, BloomEffect, BrightEffect, BlurEffect} from 'mapvgl';

export default class MapvglView extends Component {

    componentDidMount() {
        this.initialize();
        this.forceUpdate();
    }

    componentWillUnmount() {
        if (this.mapvglView) {
            this.mapvglView.destroy();
            this.mapvglView = null;
        }
    }

    componentDidUpdate(prevProps) {
        if (!this.map || !this.mapvglView) {
            this.initialize();
        }
    }

    initialize() {
        let map = this.props.map;
        if (!map) {
            return;
        }
        this.map = map;

        if (!this.mapvglView) {
            let effects = [];
            let simpleEffects = this.props.effects;
            if (simpleEffects && simpleEffects.length) {
                simpleEffects.forEach(name => {
                    if (name === 'bloom') {
                        effects.push(new BloomEffect());
                    } else if (name === 'bright') {
                        effects.push(new BrightEffect());
                    } else if (name === 'blur') {
                        effects.push(new BlurEffect());
                    }
                });
            }
            this.mapvglView = new View({
                mapType: 'bmap',
                effects,
                map
            });
        }
    }

    /**
     * 在子元素props中附上view和map字段
     * @return {string|Element} children with props
     * @memberof MapvglView
     */
    renderChildren() {
        const {children} = this.props;
        if (!children || !this.map || !this.mapvglView) {
            return;
        }

        return React.Children.map(children, child => {
            if (!child) {
                return;
            }

            if (typeof child.type === 'string') {
                return child;
            } else {
                return React.cloneElement(child, {
                    map: this.map,
                    view: this.mapvglView
                });
            }
        });
    }

    render() {
        return (
            <div title="mapvgl view">
                {this.renderChildren()}
            </div>
        );
    }

}
