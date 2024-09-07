---
layout: ../layouts/DefaultPage.astro
title: Site Roadmap
---

## Content

- [ ] Replace blog with notebook
- [ ] Sitemap
- [ ] Projects page
- [ ] Gallery

### Notebook

I think we should swap the blog for a notebook. Much as I like reading blogs, blogging does not come naturally to me. Also, if you have a subject you want to interrogate, what's the point in writing a single essay about it? That assumes you'll draw a definitive conclusion. I think a better approach is the living document: a record of your thoughts on a subject, updated as those thoughts come to you.

Writing on a computer offers distinct flexibility, and this seems like a good way to take advantage of it.

#### Private Notes?

I thought about filtering out private notes so I could have everything in one place, but that's kind of pointless since they'd still show up on GitHub. The only solution there is to make a separate private folder and tell git to ignore it. Which is maybe fine and not that big a deal, but at that point you may as well just have a totally separate workspace anyway.

### POSSE

[POSSE](https://indieweb.org/POSSE) means "post on your site, syndicate elsewhere." I'm not on social media, so I don't have any place to syndicate. But it's a good idea so I thought I'd take some notes.

The most streamlined way to do this may be to set up a [micro.blog](https://micro.blog) site and use the API to scrape this site's rss feed. From there, micro.blog handles cross posting. And if you use that, you can also get built-in newsletter capabilities for $10/month.

Sounds like a good idea, but I tried it and something was up with the encoding because apostrophes (among other things) in post titles were rendering like this: `&apos`. I think it has something to do with the way micro.blog parses rss feeds, because other services (eg Readwise) seem to work fine.

## Styles

- Add small caps to first line of posts.

## Performance

- [x] Cloudflare caching
- [ ] Add service worker

### Cloudflare caching

I set it to cache assets for a year, so font files are now being served from the user agent's cache every visit. Seemed to make the site much faster.

## Wishlist

- Search
  - Keywords > tags
- Guestbook
- Text size buttons: `bigger` or `smaller`
