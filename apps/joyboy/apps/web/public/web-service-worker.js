const CACHE_NAME = 'external-cache';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheNameKey) => {
          if (cacheWhitelist.indexOf(cacheNameKey) === -1) {
            return caches.delete(cacheNameKey); // 删除旧缓存
          } else {
            return Promise.resolve();
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_RESOURCE') {
    const url = event.data.url;
    // 处理资源预加载
    fetch(`/api/service-worker?url=${encodeURIComponent(url)}`, { mode: 'same-origin' })
      .then((response) => {
        console.log('fetch success');
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(url, response);
          });
        }
      })
      .catch((error) => {
        console.error('Preloading failed:', JSON.stringify(error));
      });
  }
});
