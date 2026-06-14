'use client';
import ReactDOM from 'react-dom';

export const DyPreloadResources = () => {
  // 由于Next Js v14 App router未支持preconnect类型的metadata，所以使用ReactDOM.preconnect和ReactDOM.prefetchDNS
  // App Router 不支持Head组件实现link的引入
  // doc https://nextjs.org/docs/app/api-reference/functions/generate-metadata#unsupported-metadata
  // 注意：需要在'use-client'的组件内使用，些方法目前只在客户端组件中得到支持，在初始页面加载时仍然是服务器端呈现的。SSR时，会执行此代码，并在html中插入links，仅是加载资源阶段是在客户端执行
  // // <link rel="dns-prefetch" href="https://direct.dy-api.com/v2/serve/user/choose" />
  // ReactDOM.prefetchDNS('https://direct.dy-api.com/v2/serve/user/choose');
  // //`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_dynamic.js`\
  // ReactDOM.preload(`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_dynamic.js`,{ as: 'script' });
  // //`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_static.js`
  // ReactDOM.preload(`https://cdn.dynamicyield.com/api/${DY_SECTION_ID}/api_static.js`,{ as: 'script' });

  ReactDOM.preconnect('//cdn.dynamicyield.com');
  ReactDOM.preconnect('//st.dynamicyield.com');
  ReactDOM.preconnect('//rcom.dynamicyield.com');
  ReactDOM.prefetchDNS('//cdn.dynamicyield.com');
  ReactDOM.prefetchDNS('//st.dynamicyield.com');
  ReactDOM.prefetchDNS('//rcom.dynamicyield.com');
  return null;
};
