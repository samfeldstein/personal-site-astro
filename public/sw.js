// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
// https://github.com/mdn/dom-examples/blob/main/service-worker/simple-service-worker/sw.js
// https://gist.github.com/cferdinandi/6e4a73a69b0ee30c158c8dd37d314663

// Variables
const coreAssets = [
  "/",
  "/index.html",
  "/offline/",
  "/blog/",
  "/tags/",
  "/favicon.ico",
  "/favicon.svg",
];

// On install, cache core assets
self.addEventListener("install", (event) => {
  // Cache core assets
  event.waitUntil(
    caches.open("app").then((cache) => {
      for (const asset of coreAssets) {
        cache.add(new Request(asset));
      }
      return cache;
    })
  );
});

// Listen for request events
self.addEventListener("fetch", (event) => {
  // Get the request
  const request = event.request;

  // Bug fix
  // https://stackoverflow.com/a/49719964
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  ) {
    return;
  }

  // HTML files
  // Network-first
  if (
    request.headers.get("Accept").includes("text/html") ||
    request.headers.get("Accept").includes("application/xml") ||
    request.headers.get("Accept").includes("text/xml")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Create a copy of the response and save it to the cache
          const copy = response.clone();
          event.waitUntil(
            caches.open("app").then((cache) => {
              return cache.put(request, copy);
            })
          );

          // Return the response
          return response;
        })
        .catch((error) => {
          // If there's no item in cache, respond with a fallback
          return caches.match(request).then(async (response) => {
            return response || (await caches.match("/offline/"));
          });
        })
    );
  }

  // CSS & JavaScript
  // Offline-first
  if (
    request.headers.get("Accept").includes("text/css") ||
    request.headers.get("Accept").includes("text/javascript")
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            // Return the response
            return response;
          })
        );
      })
    );
    return;
  }

  // Images
  // Offline-first
  if (request.headers.get("Accept").includes("image")) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            // Save a copy of it in cache
            const copy = response.clone();
            event.waitUntil(
              caches.open("app").then((cache) => {
                return cache.put(request, copy);
              })
            );

            // Return the response
            return response;
          })
        );
      })
    );
  }
});
