---
title: "Populating the page: how browsers work"
author: MDN Web Docs
tags: 
    - articles  
    - web-development  
    - web-performance
url: https://developer.mozilla.org/en-US/docs/Web/Performance/How_browsers_work
---

> the *preload scanner* will parse through the content available and request high-priority resources like CSS, JavaScript, and web fonts. Thanks to the preload scanner, we don't have to wait until the parser finds a reference to an external resource to request it. It will retrieve resources in the background so that by the time the main HTML parser reaches the requested assets, they may already be in flight or have been downloaded. The optimizations the preload scanner provides reduce blockages.


> In terms of web performance, there are many better ways to invest optimization effort, as the total time to create the CSSOM is generally less than the time it takes for one DNS lookup.


> To ensure smooth scrolling and animation, everything occupying the main thread, including calculating styles, along with reflow and paint, must take the browser less than 16.67ms to accomplish.



