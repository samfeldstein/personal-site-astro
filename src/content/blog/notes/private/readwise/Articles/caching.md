---
title: "Caching"
author: Netlify
url: https://docs.netlify.com/platform/caching/
---

> Static asset responses on Netlify are cached on Netlify’s global edge nodes and [automatically invalidated](https://docs.netlify.com/platform/caching/#automatic-invalidation-with-atomic-deploys) whenever a deploy changes the content. Static asset responses can only change with new deploys. So, unless there is a new deploy or [manual purge](https://docs.netlify.com/platform/caching/#on-demand-invalidation), we treat static asset responses as fresh for up to one year and ignore any attempts to set cache control headers with a shorter `max-age`.



