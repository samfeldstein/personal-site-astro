// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
// https://github.com/mdn/dom-examples/blob/main/service-worker/simple-service-worker/sw.js

const cacheVersion = "v1";
const coreAssets = ["/", "/index.html", "/offline/", "/blog/", "/tags/"];

// On install, cache core assets
self.addEventListener("install", async (event) => {
  const cache = await caches.open(cacheVersion);
  event.waitUntil(cache.addAll(coreAssets));
});

// Handle requests
self.addEventListener("fetch", async (event) => {
  const request = event.request;

  // Network-first
  if (request.headers.get("Accept").includes("text/html")) {
    try {
      const response = await fetch(request);
      event.waitUntil(updateCache(request, response.clone()));
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse;
    }
  }

  // Cache-first
  // If not found, check network
  event.respondWith(
    (async () => {
      const cacheResponse = await caches.match(request);
      if (cacheResponse) {
        return cacheResponse;
      }

      try {
        const networkResponse = await fetch(request);
        event.waitUntil(updateCache(request, networkResponse.clone()));
        return networkResponse;
      } catch (error) {
        return new Response("Offline", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }
    })()
  );
});

async function updateCache(request, response) {
  const cache = await caches.open(cacheVersion);
  await cache.put(request, response);
}
