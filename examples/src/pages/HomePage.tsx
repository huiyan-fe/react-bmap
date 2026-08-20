import React from 'react';
import { Link } from 'react-router-dom';
import { COMPONENTS, CATEGORIES } from '../config/components';

const FEATURES = [
  {
    title: '声明式 API',
    desc: '采用 React 声明式写法，像使用普通组件一样操作地图',
  },
  {
    title: '多版本 JSAPI',
    desc: '兼容 JSAPI 3.0 / 4.0（WebGL），按需选择配置',
  },
  {
    title: 'TypeScript',
    desc: '完整类型定义，IDE 自动补全，类型安全',
  },
  {
    title: '能力矩阵',
    desc: '运行时能力探测，v3/v4 差异自动降级',
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
          使用声明式组件方式开发百度地图应用，兼容 BMap (JSAPI 3.0) 与 BMapGL (4.0 WebGL)，可按需选择配置。
          提供地图容器、覆盖物、控件、图层、路线规划、输入提示等一系列组件与 Hooks。
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
          使用 BMapProvider 加载百度地图 JSAPI（无需在 HTML 中手动引入
          <code>&lt;script&gt;</code>，
          <a href="http://lbsyun.baidu.com/apiconsole/key" target="_blank" rel="noopener noreferrer">
            申请密钥
          </a>
          ），通过 <code>version</code> 按需选择 3.0 / 4.0：
        </p>
        <div className="home-code-block">
          <div className="home-code-label">Hello World</div>
          <pre><code>{`import { BMapProvider, Map, Marker } from 'react-bmap';

<BMapProvider ak="您的密钥" version="4.0">
  <Map center={{ lng: 116.4, lat: 39.9 }} zoom={11}>
    <Marker position={{ lng: 116.4, lat: 39.9 }} />
  </Map>
</BMapProvider>`}</code></pre>
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">组件列表</h2>
        <p className="home-section-desc">
          点击组件名称查看示例与代码
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
