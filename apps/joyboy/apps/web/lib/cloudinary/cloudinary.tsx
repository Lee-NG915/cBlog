'use client';
import ReactDOM from 'react-dom';

export const CloudinaryPreloadResources = () => {
  // Cloudinary 的资源预加载
  ReactDOM.preconnect('https://res.cloudinary.com');
  ReactDOM.prefetchDNS('https://res.cloudinary.com');
  return null;
};
