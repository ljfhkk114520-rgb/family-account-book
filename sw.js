// Service Worker for 深漂三口之家做账工作台
const CACHE_NAME = 'family-account-book-v1';
const ASSETS = [
  '/family-account-book/',
  '/family-account-book/index.html',
  '/family-account-book/styles.css',
  '/family-account-book/app.js',
  '/family-account-book/manifest.json',
  '/family-account-book/icon-192.png',
  '/family-account-book/icon-512.png'
];

// 安装：预缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 请求：缓存优先，网络更新
self.addEventListener('fetch', event => {
  // 跳过非GET请求和非http请求
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 有缓存就先返回，同时后台更新
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
