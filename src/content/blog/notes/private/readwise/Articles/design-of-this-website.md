---
title: "Design of This Website"
author: Gwern Branwen
url: https://gwern.net/design#backlink
---

> The existence of HTML identifying IDs on the `<a>` hyperlink elements is critical to making bidirectional links work: one cannot link what one cannot name.⁠[⁠9⁠](https://gwern.net/design#fn9)


> Backlinks are implemented as an offline process which parses the Markdown sources for pages & the HTML for annotations, and extracts URLs+IDs. They *could* be implemented at compile-time, but it is not a good fit for a static site generator like Hakyll, so I simply run the backlinks as a cron job at night.



