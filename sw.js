const CACHE_NAME = 'qr-decryptor-cache-v1';
const urlsToCache = [
    './', // index.html을 캐시합니다.
    'index.html', // index.html을 명시적으로 캐시합니다.
    '/manifest.json',
    // 아이콘 이미지 파일들. 실제 아이콘 경로와 이름을 맞춰주세요.
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

self.addEventListener('install', (event) => {
    // 서비스 워커 설치 시점에 캐시할 파일들을 미리 추가합니다.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // 네트워크 요청을 가로채서 캐시된 응답을 먼저 확인하고, 없으면 네트워크를 통해 가져옵니다.
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에 일치하는 응답이 있으면 해당 응답을 반환합니다.
                if (response) {
                    return response;
                }
                // 캐시에 없으면 네트워크를 통해 요청하고, 네트워크 오류 시 대체 응답을 반환합니다.
                return fetch(event.request).catch(() => {
                    console.log('Network request failed and no cache match:', event.request.url);
                    // 오프라인일 때 특정 HTML 페이지를 보여주고 싶다면 여기를 수정하세요.
                    // 예: if (event.request.mode === 'navigate') { return caches.match('/offline.html'); }
                    return new Response('Offline: 네트워크 요청에 실패했으며 캐시된 버전이 없습니다.');
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    // 이전 버전의 캐시를 정리합니다.
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
