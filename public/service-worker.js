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

// Served cached assets from the cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const cachedRequest = coreAssets.includes(url.pathname);

  if (cachedRequest) {
    // Grab the precached asset from the cache
    event.respondWith(caches.open(cacheVersion).then((cache) => {
      return cache.match(event.request.url);
    }));
  } else {
    // Go to the network
    return;
  }
});