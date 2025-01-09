---
title: "Using Service Workers"
author: MDN Web Docs
url: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
---

> The primary use of `activate` is to clean up resources used in previous versions of the service worker.


> A single service worker can control many pages. Each time a page within your scope is loaded, the service worker is installed against that page and operates on it.


> A `fetch` event fires every time any resource controlled by a service worker is fetched, which includes the documents inside the specified scope, and any resources referenced in those documents



