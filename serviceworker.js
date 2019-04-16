var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
  '/',
  '/fallback.json',
  '/css/style.css',
  '/js/jquery.min.js',
  '/js/main.js',
  '/images/PWA-logo.png'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
        console.log('In Install service worker... cache openend!');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
    var request = event.request
    var url     = new URL(request.url)
    
    //Pisahkan request API dan Internal

    if(url.origin === location.origin) {
        event.respondWith(
            caches.match(request).then(function(response){
                return response || fetch(request)
            })        
        )
    } else {
        event.respondWith(
            caches.open('products-cache').then(function(cache){
                return fetch(request).then(function(liveResponse){
                    cache.put(request, liveResponse.clone())
                    return liveResponse
                }).catch(function(){
                    return caches.match(request).then(function(response){
                        if(response) return response
                        return caches.match('/fallback.json')
                    })
                })
            })
        )
    } 
});


self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName){
                    return cacheName != CACHE_NAME
                }).map(function(cacheName){
                    return caches.delete(cacheName)
                })
            );
        })
    );
});