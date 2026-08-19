import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// 抑制百度 JSAPI 自身抛出的销毁期噪声错误。
// 快速切换 demo 页面时，destroy 时仍在飞的瓦片请求回调会在几百毫秒后才落地，
// 读到已被置空的 SDK 内部引用 → "Cannot read properties of null (reading 'tileInfo')"。
// 这类回调不经过 react-bmap 的调用栈，库侧 try/catch 抓不到；错误发生在 SDK 脚本内部、
// 也不影响功能，所以在 demo 应用这一层按「来源是百度脚本」过滤掉。
// 只吞这一类，其余错误（包括 demo 自己的）照常抛到控制台。
const SDK_SOURCE = /api\.map\.baidu\.com|\.bdimg\.com/;
window.addEventListener('error', event => {
  const stack = (event.error as Error | undefined)?.stack || '';
  const fromSDK = SDK_SOURCE.test(event.filename || '') || SDK_SOURCE.test(stack);
  if (fromSDK && /Cannot read propert(?:y|ies) of (?:null|undefined)/.test(event.message || '')) {
    event.preventDefault();
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
