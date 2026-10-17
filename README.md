# Sam Feldstein’s Personal Site

The source for [samfeldstein.xyz](https://samfeldstein.xyz), home to my published writing, photography, and coding projects.

I keep this repo public mainly as a code sample. You’re welcome to read it, borrow from it, or fork it. The content is mine.

## The idea

The site is set like an old book. The home page is a cloth-bound cover, and scrolling turns to a contents page, with dotted leaders running to page numbers. Each section is a chapter: Code is a list of projects pulled from GitHub, Photography is a mosaic of photos you can open full screen, and Published Writing is a list of works. Every page ends with an epigraph (a random quote from my collection) and a colophon. The 404 page is an erratum slip.

Everything is set in Cormorant Garamond, with real small caps, old-style figures, and historical ligatures. The colors are aged paper, iron-gall ink, and a little vermilion. The site follows your system’s light or dark setting.

## Stack

- Plain HTML, CSS, and JavaScript. No framework, no bundler.
- A few small Node scripts that keep the pages consistent and check them before anything deploys.
- Cloudflare Workers static assets for hosting. Cloudflare builds and deploys from GitHub on every push.

The site ran on Astro until October 2026. I rebuilt it as plain files, the same way I rebuilt [presswork.dev](https://github.com/samfeldstein/presswork-web-co), and then redesigned it as a book. The whole story is in [docs/makeover-report.md](docs/makeover-report.md).

## How it works

### Shared parts

The deployed folder is `site/`, and each page is a plain HTML file. Anything that appears on more than one page lives once in `shared/`: the head tags, the running head, the epigraph and colophon, the Lighthouse scores, the copyright line, and the stylesheets. [sync.mjs](sync.mjs) writes these into every page between marker comments and inlines each page’s CSS. It also adds a content hash to script links, so scripts can be cached for good, and writes the sitemaps.

Each page starts with a small JSON comment giving its title, description, stylesheets, and the fonts to preload. The shared book styles are in [shared/css/book.css](shared/css/book.css), and a page gets its own stylesheet only when it needs one.

### Checks

[check.mjs](check.mjs) fails the build when the site has drifted or something is broken. It checks that:

- the shared parts and sitemaps are up to date;
- every page has one `<h1>`, one `<main>`, a title and a description, and every image has alt text;
- internal links and asset paths resolve;
- every character on every page is covered by the font subset I ship;
- each page stays under a gzipped size budget;
- scripts load as modules, and nothing loads from a host that isn’t on an allowlist.

The tests in `test/` plant bugs on purpose to prove the checks catch them.

### Projects from GitHub

The Code page lists my public GitHub repositories. [projects.mjs](projects.mjs) fetches them on every deploy and writes the list, newest first. Before a new repository appears, I approve its display name in [projects.json](projects.json). Until then, the script reports it with a suggested name, and the page goes on without it. A project older than its repository gets its real start month in `projects.json`. The script also flags any language that makes up a fifth or more of a repository but is missing from the skills line, which I edit by hand. If GitHub can’t be reached, the list stays as it was, so a deploy never fails or goes blank because of it.

### Photo gallery

The Photography page is built from whatever images are in `photos/`. [photos.mjs](photos.mjs) reads each photo’s title, description, date, and location with ExifTool, writes WebP copies at several widths into `site/img/photos/`, and rewrites the gallery, newest first. The description becomes the alt text, so I caption a photo once in my editor and it carries through to the site. The location (city, state, country) shows when a photo has one, and the script lists the photos that don’t.

The gallery is a justified mosaic: each row fills the width at one height, and every photo keeps its own shape. Hovering or focusing a photo shows its title, location, and date. Clicking opens it full screen in a `<dialog>`, with arrow keys to move through photos and Escape to close. Without JavaScript, each photo is still a plain link to the full image.

### Quote generator

The epigraph shows a random quote from my collection of lines from books, comics, films, poems, and songs. [quote.js](site/js/quote.js) picks one in the browser and builds the attribution from whichever fields the quote has. Titles of short works like poems and songs get quotation marks instead of italics.

### Lighthouse scores

The colophon shows the site’s own Lighthouse scores. I run Lighthouse (mobile) and pass the numbers to [lighthouse.mjs](lighthouse.mjs), which writes them into `shared/lighthouse.html`. Without numbers, it calls the PageSpeed Insights API instead.

### Hosting

- **Build.** Cloudflare runs `npm run build`: the project list, then sync in check mode, then `check.mjs`. A page that has drifted never deploys.
- **Prefetch.** Speculation Rules prefetch internal links in Chromium, and a small script adds `<link rel="prefetch">` elsewhere. Cross-document view transitions smooth out page changes.
- **Caching.** [site/_headers](site/_headers) caches fonts and scripts for good, and images for a shorter time.
- **Old URLs.** [site/_redirects](site/_redirects) keeps links to earlier versions of the site working.

## Project structure

```text
├── sync.mjs            Writes shared parts into pages, inlines CSS, writes sitemaps
├── check.mjs           Fails on drift, broken links, uncovered characters, size
├── projects.mjs        Writes the Code page's project list from GitHub
├── projects.json       Approved project names
├── photos.mjs          Builds the gallery from photos/
├── lighthouse.mjs      Writes the Lighthouse scores
├── test/               Tests for the scripts and checks
├── photos/             Source photos (not deployed)
├── shared/             Head, running head, end matter, scores, copyright, facts.json, css/
├── _archive/           Pages taken off the site but kept (résumés)
└── site/               Deployed as is
    ├── index.html, published-writing/, photos/, code/, 404.html
    ├── js/             quote.js, gallery.js
    ├── img/photos/     Gallery WebPs
    ├── static/         Fonts, images, résumé PDFs
    └── _headers, _redirects, robots.txt, sitemaps
```

## Running it locally

```bash
npm install
npx wrangler dev
```

Pages use root-relative paths, so they need a server, not `file://`.

Before committing:

```bash
node sync.mjs && node check.mjs && node --test test/*.test.mjs
```

After adding, removing, or re-captioning photos:

```bash
node photos.mjs
```

To refresh the project list, and see any new repositories waiting for a name:

```bash
node projects.mjs
```

## Reuse

The code is here to learn from and borrow. The writing and photos are mine, so please don’t republish them as your own.
