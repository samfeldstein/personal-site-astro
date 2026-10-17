# Sam Feldstein’s Personal Site

The source for [samfeldstein.xyz](https://samfeldstein.xyz), home to my published writing, photography, and coding projects.

I keep this repo public mainly as a code sample. You’re welcome to read it, borrow from it, or fork it. The content is mine.

## Stack

- Plain HTML, CSS, and JavaScript. No framework, no bundler, no build step.
- A few dependency-free Node scripts that keep the pages consistent and check them
- [sharp](https://sharp.pixelplumbing.com) and [exiftool-vendored](https://github.com/photostructure/exiftool-vendored.js) for the photo gallery, run by hand when the photos change
- Cloudflare Workers static assets for hosting. Cloudflare builds and deploys from GitHub on every push.

The site ran on Astro until 2026. I rebuilt it as plain files, the same way I rebuilt [presswork.dev](https://github.com/samfeldstein/presswork-web-co), and kept every page looking as it did.

## How it works

### Shared parts

The deployed folder is `site/`, and each page is a plain HTML file. The parts every page shares (the head, the skip link, the copyright line) live once in `shared/`, along with `facts.json` (site name, description, email). [sync.mjs](sync.mjs) writes them into every page between marker comments. Each page starts with a small JSON comment that gives its title, description, stylesheets, and the fonts to preload, so a page can depart from the rest of the site without affecting anything else. The home page is set like an old book, in Cormorant Garamond: a cloth cover, then a contents page with dotted leaders and page numbers, an epigraph (a random quote from my collection), and a colophon. The [Code](site/code/index.html) page uses Victor Mono and Orbitron, and the rest use Oswald and Noto Serif.

The CSS lives in `shared/css/`, and sync inlines each page’s stylesheets into a `<style>` tag, as Astro did. It also adds a content hash to every script link, so scripts can be cached as immutable, and writes the sitemaps.

All the fonts are self-hosted variable woff2 files. Each `@font-face` limits the font to the characters it covers with `unicode-range`, and pairs it with a metric-adjusted local fallback that uses `size-adjust`, so text doesn’t jump when the web font loads. Colors are `light-dark()` tokens, so every page follows the OS light or dark setting without any JavaScript.

### Checks

[check.mjs](check.mjs) fails the build when the site has drifted or something is broken. It checks that:

- the shared parts and sitemaps are up to date;
- every page has one `<h1>`, one `<main>`, a title, and a description, and every image has alt text;
- internal links and asset paths resolve;
- every character on every page is covered by the font subsets I ship;
- each page stays under a gzipped size budget;
- scripts load as modules, and nothing loads from a host that isn’t on an allowlist.

Cloudflare runs `npm run build`, which runs sync in check mode and then `check.mjs`, so a page that has drifted never deploys.

### Photo gallery

The [Photos](site/photos/index.html) page is built from whatever images are in `photos/`. Nothing needs to be listed by hand. [photos.mjs](photos.mjs) reads each photo’s embedded title, description, and creation date with ExifTool, writes WebP copies at seven widths into `site/img/photos/`, and rewrites the gallery markup newest first. The description becomes the alt text, so I write captions once in my photo editor and they carry through to the site. Only missing sizes are generated, and sizes for deleted photos are removed. The first photo loads eagerly with high fetch priority, and the rest lazy-load.

### Lighthouse scores

The home page footer shows the site’s own Lighthouse metrics: blocking time, speed index, time to interactive, and the performance score. I run Lighthouse (mobile) by hand and pass the numbers to [lighthouse.mjs](lighthouse.mjs), which writes them into the page. Without numbers, it calls the PageSpeed Insights API for the live home page instead.

### Quote generator

The footer on the home and Code pages shows a random quote from my collection of lines from books, comics, films, poems, and songs. [quote.js](site/js/quote.js) picks one in the browser and builds the attribution from whichever fields the quote has: speaker, work, verse, and year. Titles of short works like poems, essays, and songs get quotation marks instead of italics. On localhost it always shows the first quote, so I can check the layout against a known example.

### Hosting

- **Prefetch.** A Speculation Rules block prefetches internal links in Chromium, and a small script adds `<link rel="prefetch">` elsewhere. Cross-document view transitions smooth out page changes.
- **Caching.** [site/_headers](site/_headers) gives fonts and scripts long-lived immutable caching, and images a shorter lifetime.
- **Old URLs.** [site/_redirects](site/_redirects) keeps links to earlier versions of the site working.
- **Hosting.** [wrangler.jsonc](wrangler.jsonc) serves `site/` as Cloudflare Workers static assets and uses the custom 404 page for missing routes.

## Project structure

```text
├── sync.mjs            Writes shared parts into pages, inlines CSS, writes sitemaps
├── check.mjs           Fails on drift, broken links, uncovered characters, size
├── photos.mjs          Builds the gallery from photos/
├── lighthouse.mjs      Writes the Lighthouse panel on the home page
├── wrangler.jsonc      Cloudflare static assets config
├── test/               Tests for check.mjs
├── photos/             Source photos (not deployed)
├── shared/
│   ├── head.html, skip-link.html, copyright.html
│   ├── facts.json      Site name, description, emails, allowed hosts, size budget
│   └── css/            Base styles and one file per page type
└── site/               Deployed as is
    ├── index.html, code/, photos/, published-writing/, 404.html
    ├── js/quote.js
    ├── img/photos/     Gallery WebPs
    ├── static/         Fonts, images, résumé PDFs
    └── _headers, _redirects, robots.txt, sitemaps
```

## Running it locally

```bash
npx wrangler dev
```

Pages use root-relative paths, so they need a server, not `file://`. Any static server on `site/` works too.

After editing a page or anything in `shared/`, and before committing:

```bash
node sync.mjs && node check.mjs && node --test test/*.test.mjs
```

To update the gallery after adding, removing, or re-captioning photos (`exiftool-vendored` bundles ExifTool, so there’s nothing else to install):

```bash
npm install
node photos.mjs
```

## Reuse

The code is here to learn from and borrow. The writing and photos are mine, so please don’t republish them as your own.
