---
title: "Prerender Pages in Chrome for Instant Page Navigations"
author: Chrome for Developers
url: https://developer.chrome.com/docs/web-platform/prerender-pages
---

> In each of these cases, a prerender behaves as if the page has been opened in an invisible background tab, and then is "activated" by replacing the foreground tab with that prerendered page. If a page is activated before it has fully prerendered, then its current state is "foregrounded" and continues to load, which means you can still get a good head start.


> prerendering does use additional memory and network bandwidth. Be careful not to over-prerender, at a cost of user resources. Only prerender when there is a high likelihood of the page being navigated to.



