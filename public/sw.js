// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
// https://github.com/mdn/dom-examples/blob/main/service-worker/simple-service-worker/sw.js

const CACHE_VERSION = "v1";

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
  // First try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Next try to use the preloaded response, if it's there
  // NOTE: Chrome throws errors regarding preloadResponse, see:
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1420515
  // https://github.com/mdn/dom-examples/issues/145
  // To avoid those errors, remove or comment out this block of preloadResponse
  // code along with enableNavigationPreload() and the "activate" listener.
  const preloadResponse = await preloadResponsePromise;
  if (preloadResponse) {
    console.info("using preload response", preloadResponse);
    putInCache(request, preloadResponse.clone());
    return preloadResponse;
  }

  // Next try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request.clone());
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(fallbackUrl);
    if (fallbackResponse) {
      return fallbackResponse;
    }
    // when even the fallback response is not available,
    // there is nothing we can do, but we must always
    // return a Response object
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
};

const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    // Enable navigation preloads!
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener("activate", (event) => {
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    addResourcesToCache(["/", "/offline/", "/blog/", "/tags/"])
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    cacheFirst({
      request: event.request,
      preloadResponsePromise: event.preloadResponse,
      fallbackUrl: "/offline/",
    })
  );
});

// const CACHE_VERSION = "v1";
// const CORE_ASSETS = ["/", "/offline/"];

// const addResourcesToCache = async (resources) => {
//   const cache = await caches.open(CACHE_VERSION);
//   await cache.addAll(resources);
// };

// const putInCache = async (request, response) => {
//   const cache = await caches.open(CACHE_VERSION);
//   await cache.put(request, response);
// };

// const networkFirst = async ({ request, fallbackUrl }) => {
//   try {
//     const responseFromNetwork = await fetch(request.clone());
//     if (responseFromNetwork && responseFromNetwork.status === 200) {
//       putInCache(request, responseFromNetwork.clone());
//       return responseFromNetwork;
//     }
//   } catch (error) {
//     const responseFromCache = await caches.match(request);
//     if (responseFromCache) {
//       return responseFromCache;
//     }
//     if (fallbackUrl) {
//       const fallbackResponse = await caches.match(fallbackUrl);
//       if (fallbackResponse) {
//         return fallbackResponse;
//       }
//     }
//     return new Response("Network error happened", {
//       status: 408,
//       headers: { "Content-Type": "text/plain" },
//     });
//   }
// };

// const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
//   const responseFromCache = await caches.match(request);
//   if (responseFromCache) {
//     return responseFromCache;
//   }

//   const preloadResponse = await preloadResponsePromise;
//   if (preloadResponse) {
//     console.info("using preload response", preloadResponse);
//     putInCache(request, preloadResponse.clone());
//     return preloadResponse;
//   }

//   try {
//     const responseFromNetwork = await fetch(request.clone());
//     putInCache(request, responseFromNetwork.clone());
//     return responseFromNetwork;
//   } catch (error) {
//     const fallbackResponse = await caches.match(fallbackUrl);
//     if (fallbackResponse) {
//       return fallbackResponse;
//     }
//     return new Response("Network error happened", {
//       status: 408,
//       headers: { "Content-Type": "text/plain" },
//     });
//   }
// };

// const enableNavigationPreload = async () => {
//   if (self.registration.navigationPreload) {
//     await self.registration.navigationPreload.enable();
//   }
// };

// self.addEventListener("install", (event) => {
//   // Pre-cache resources if necessary
//   event.waitUntil(addResourcesToCache(CORE_ASSETS));
// });

// self.addEventListener("activate", (event) => {
//   // Claim clients immediately so the new service worker takes control
//   event.waitUntil(
//     caches
//       .keys()
//       .then((cacheNames) => {
//         return Promise.all(
//           cacheNames.map((cacheName) => {
//             if (cacheName !== CACHE_VERSION) {
//               return caches.delete(cacheName);
//             }
//           })
//         );
//       })
//       .then(() => self.clients.claim())
//   );
//   enableNavigationPreload();
// });

// self.addEventListener("fetch", (event) => {
//   const url = new URL(event.request.url);

//   // Exclude files
//   // https://stackoverflow.com/questions/45663796/setting-service-worker-to-exclude-certain-urls-only
//   if (
//     event.request.mode === "navigate" ||
//     (event.request.method === "GET" &&
//       (event.request.headers.get("accept").includes("text/html") ||
//         event.request.headers.get("accept").includes("application/xml")))
//   ) {
//     event.respondWith(
//       networkFirst({
//         request: event.request,
//         fallbackUrl: "/offline",
//       })
//     );
//   } else {
//     event.respondWith(
//       cacheFirst({
//         request: event.request,
//         preloadResponsePromise: event.preloadResponse,
//         fallbackUrl: "/offline",
//       })
//     );
//   }
// });

// // Function to clear all caches
// const clearAllCaches = async () => {
//   const cacheNames = await caches.keys();
//   return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
// };

// // Listen for messages from the client to clear the cache
// self.addEventListener("message", (event) => {
//   if (event.data && event.data.type === "CLEAR_ALL_CACHES") {
//     event.waitUntil(clearAllCaches());
//   }
// });
