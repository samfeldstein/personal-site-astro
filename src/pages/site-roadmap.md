---
layout: ../layouts/DefaultPage.astro
title: Site Roadmap
---

## Site

- [POSSE](https://indieweb.org/POSSE)
  - Most streamlined way to do this maybe to set up a micro.blog site, then use API to send posts from here to there. Then let micro.blog handle cross posting. And if you use that, you may as well use its newsletter capabilities anyway.
  - Does Substack have an API?
  - I tried the first method and something was up with the encoding because apostrophes (among other things) in post titles were rendering like this: `&apos`. I think it has something to do with the way micro.blog parses it, because other rendering (Readwise, for example) seems to work fine.
- Projects page
- Photos page
- Add small caps to first line of posts.

### Performance

- Increase cache life in Cloudflare
  - This seemed to make a huge difference in performance, because font files are now being served from the cache.

## Wishlist

- Guestbook
- Text size buttons: `bigger` or `smaller`
- Search
  - Keywords > tags
