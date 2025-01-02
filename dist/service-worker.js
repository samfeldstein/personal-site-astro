// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

const cacheVersion = "v1";

const coreAssets = [
  "/fonts/subset-EBGaramond-Bold.woff",
  "/fonts/subset-EBGaramond-Bold.woff2",
  "/fonts/subset-EBGaramond-BoldItalic.woff",
  "/fonts/subset-EBGaramond-BoldItalic.woff2",
  "/fonts/subset-EBGaramond-Italic.woff",
  "/fonts/subset-EBGaramond-Italic.woff2",
  "/fonts/subset-EBGaramond-Regular.woff",
  "/fonts/subset-EBGaramond-Regular.woff2",
  "/site.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/apple-touch-icon.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png"
];

// Cache assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(cacheVersion).then((cache) => {
    return cache.addAll(coreAssets);
  }));
});

// Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== cacheVersion) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for request events
self.addEventListener("fetch", (event) => {
  // Get the request
  const request = event.request;
  const url = new URL(request.url);

  // Handle "only-if-cached" bug fix
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  ) {
    return;
  }

  // Check if request is HTML, XML, or JavaScript (network-first strategy)
  const isNetworkFirstRequest = request.headers.get("Accept") && (
    request.headers.get("Accept").includes("text/html") ||
    request.headers.get("Accept").includes("application/xml") ||
    request.headers.get("Accept").includes("text/xml") ||
    request.headers.get("Accept").includes("javascript")
  );

  if (isNetworkFirstRequest) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response) {
            throw new Error('No response received');
          }

          // Create a copy of the response and save it to the cache
          const copy = response.clone();
          event.waitUntil(
            caches.open(cacheVersion)
              .then((cache) => cache.put(request, copy))
              .catch((error) => console.error('Cache storage failed:', error))
          );

          return response;
        })
        .catch((error) => {
          console.error('Network fetch failed:', error);
          // Fallback to cache if network fails
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If no cache exists, you might want to return a custom offline page
              // return caches.match('/offline.html');
              throw error;
            });
        })
    );
  } else {
    // Cache-first strategy for other resources
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, fetch from network
          return fetch(request)
            .then((response) => {
              // Validate response
              if (!response || response.status !== 200) {
                return response;
              }

              // Save a copy in cache
              const copy = response.clone();
              event.waitUntil(
                caches.open(cacheVersion)
                  .then((cache) => cache.put(request, copy))
                  .catch((error) => console.error('Cache storage failed:', error))
              );

              return response;
            })
            .catch((error) => {
              console.error('Network fetch failed:', error);
              throw error;
            });
        })
    );
  }
});