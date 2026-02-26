import React from 'react';
import { Link } from 'react-router-dom';
import { COMPONENTS, CATEGORIES } from '../config/components';

const FEATURES = [
  {
    title: '声明式 API',
    desc: '采用 React 声明式写法，像使用普通组件一样操作地图',
  },
  {
    title: '2D / GL 双引擎',
    desc: '支持 BMap (2D/3.0) 与 BMapGL (WebGL)，按需切换',
  },
  {
    title: 'TypeScript',
    desc: '完整类型定义，Zod Schema 驱动 API 文档',
  },
  {
    title: '可视化扩展',
    desc: '集成 mapv、mapvgl，支持迁徙图、热力图等',
  },
];

export function HomePage() {
  return (
    <div className="home-page">
      <header className="home-hero">
        <h1 className="home-title">React-BMap</h1>
        <p className="home-subtitle">
          基于百度地图 JavaScript API 封装的 React 组件库
        </p>
        <p className="home-desc">
          使用声明式组件方式开发百度地图应用，支持 BMap (JSAPI 2.0/3.0) 与 BMapGL (WebGL)。
          内置 28+ 组件，覆盖地图容器、覆盖物、控件、图层、路线规划、输入提示等常用场景。
        </p>
      </header>

      <section className="home-features">
        {FEATURES.map((f, i) => (
          <div key={i} className="home-feature-card">
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="home-section">
        <h2 className="home-section-title">快速开始</h2>
        <div className="home-code-block">
          <div className="home-code-label">安装</div>
          <pre><code>npm install react-bmap</code></pre>
        </div>
        <p className="home-note">
          使用前需在 HTML 中引入百度地图 API（
          <a href="http://lbsyun.baidu.com/apiconsole/key" target="_blank" rel="noopener noreferrer">
            申请密钥
          </a>
          ）：
        </p>
        <div className="home-code-block">
          <pre><code>{`<script src="//api.map.baidu.com/api?v=3.0&ak=您的密钥"></script>`}</code></pre>
        </div>
        <div className="home-code-block">
          <div className="home-code-label">Hello World</div>
          <pre><code>{`import { Map, Marker, NavigationControl } from 'react-bmap';

<Map center={{ lng: 116.4, lat: 39.9 }} zoom={11}>
  <Marker position={{ lng: 116.4, lat: 39.9 }} />
  <NavigationControl />
</Map>`}</code></pre>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">组件列表</h2>
        <p className="home-section-desc">
          点击组件名称查看示例与 API 文档
        </p>
        <div className="home-components">
          {CATEGORIES.map((cat) => {
            const items = COMPONENTS.filter((c) => c.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat} className="home-category">
                <h3 className="home-category-title">{cat}</h3>
                <div className="home-component-grid">
                  {items.map((c) => (
                    <Link
                      key={c.id}
                      to={`/component/${c.id}`}
                      className="home-component-link"
                    >
                      <span className="home-component-name">{c.name}</span>
                      <span className="home-component-desc">{c.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="home-footer">
        <p>
          <a href="https://github.com/huiyan-fe/react-bmap" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {' · '}
          <a href="https://www.npmjs.com/package/react-bmap" target="_blank" rel="noopener noreferrer">
            npm
          </a>
          {' · MIT License'}
        </p>
      </footer>
    </div>
  );
}
