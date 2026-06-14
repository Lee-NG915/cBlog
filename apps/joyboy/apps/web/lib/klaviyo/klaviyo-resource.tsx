'use client';
import ReactDOM from 'react-dom';

export const KlaviyoPreloadResources = () => {
  // Klaviyo 的资源预加载
  ReactDOM.preconnect('https://static.klaviyo.com');
  ReactDOM.prefetchDNS('https://static.klaviyo.com');
  return null;
};
