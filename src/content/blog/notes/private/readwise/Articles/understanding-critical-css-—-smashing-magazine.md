---
title: "Understanding Critical CSS — Smashing Magazine"
author: About The Author
url: https://www.smashingmagazine.com/2015/08/understanding-critical-css/
---

> The critical rendering path represents the steps that the browser takes to render a page. We want to find the **minimum set of blocking CSS**, or the _critical CSS_, that we need to make the page appear to the user.


> To start working with the critical CSS for our web page, we need to change our approach to the way we handle the CSS – this means splitting it into two files. For the first file, we extract only the minimum set of CSS required to render the above-the-fold content, and then we inline it in the web page. For the second file, or the non-critical CSS, we asynchronously load it so as not to block the web page.



