# Sam Feldstein’s Personal Site

The source for [samfeldstein.xyz](https://samfeldstein.xyz), home to my published writing, photography, and coding projects.

I keep this repo public mainly as a code sample. You’re welcome to read it, borrow from it, or fork it. The content is mine.

## Stack

- [Astro](https://astro.build) for static site generation
- Sass for styles, with PostCSS running autoprefixer and cssnano
- [exiftool-vendored](https://github.com/photostructure/exiftool-vendored.js) for reading photo metadata at build time
- The PageSpeed Insights API for live performance scores
- Cloudflare Workers static assets for hosting. Cloudflare builds and deploys from GitHub on every push.

There's no client-side framework. The only browser scripts I wrote are the quote generator and a small viewport-height fix on the home page.

## How it works

### Per-page styling

Any page can be styled on its own. Each page imports its own Sass partial and tells the layout which fonts it uses, so a page can depart from the rest of the site without affecting anything else. Most pages share Oswald and Noto Serif, while the [Code](src/pages/code.astro) page has its own look, with Victor Mono and Orbitron.

All the fonts are self-hosted variable woff2 files. Each `@font-face` in [src/styles/fonts/](src/styles/fonts/) limits the font to the characters it covers with `unicode-range`. It also pairs the font with a metric-adjusted local fallback that uses `size-adjust`, so text doesn't jump when the web font loads. Colors are `light-dark()` tokens in [_config.scss](src/styles/_config.scss), so every page follows the OS light or dark setting without any JavaScript.

### Photo gallery

The [Photos](src/pages/photos.astro) page is built from whatever image files are in `src/images/gallery/`. Nothing needs to be listed by hand. [get-gallery-images.js](src/scripts/get-gallery-images.js) collects the files with `import.meta.glob`. It reads each photo's embedded title, description, and creation date with ExifTool and sorts the photos newest first. The description becomes the alt text, so I write captions once in my photo editor and they carry through to the site.

[Gallery.astro](src/components/photos/Gallery.astro) renders each photo with Astro's `<Image>` at seven responsive widths, with a `sizes` attribute matched to the layout's breakpoints. The first photo loads eagerly with high fetch priority, and the rest lazy-load.

### Live Lighthouse scores

The home page footer shows the site's own Lighthouse metrics: blocking time, speed index, time to interactive, and the performance score. During each production build, [PageSpeed.astro](src/components/PageSpeed.astro) calls the PageSpeed Insights API ([lighthouse-scores.js](src/scripts/lighthouse-scores.js)) for the page's live URL. That way, the numbers reflect the site as it's currently deployed. The API key comes from a `PSI_KEY` environment variable set in Cloudflare. In development, the component shows stub numbers instead of calling the API, and if the request fails, the panel doesn't render.

### Quote generator

The footer on the home and Code pages shows a random quote from [src/data/quotes.js](src/data/quotes.js), my collection of lines from books, comics, films, poems, and songs. [QuoteGenerator.astro](src/components/QuoteGenerator.astro) picks one in the browser and builds the attribution from whichever fields the quote has: speaker, work, verse, and year. Titles of short works like poems, essays, and songs get quotation marks instead of italics. In development, it always shows the first quote, so I can check the layout against a known example.

### Performance and hosting

- **Navigation.** Astro prefetches every link once it enters the viewport, and cross-document view transitions smooth out page changes.
- **Caching.** [public/_headers](public/_headers) gives hashed assets, fonts, and images long-lived immutable caching, and HTML a shorter cache lifetime.
- **Old URLs.** [public/_redirects](public/_redirects) keeps links to earlier versions of the site working.
- **Hosting.** [wrangler.jsonc](wrangler.jsonc) serves `dist/` as Cloudflare Workers static assets and uses the custom 404 page for missing routes.

## Project structure

```text
├── astro.config.mjs        Site URL, Markdown plugins, prefetch, sitemap
├── config.mjs              Site title, description, location, and email
├── wrangler.jsonc          Cloudflare static assets config
├── public/
│   ├── static/fonts/       Self-hosted woff2 fonts
│   ├── _headers            Cache rules
│   └── _redirects          Legacy URL redirects
└── src/
    ├── pages/              Home, Published Writing, Photos, Code, 404
    ├── layouts/Base.astro  Page shell
    ├── components/         Head, gallery, quote generator, Lighthouse panel, icons
    ├── data/               Published writing and quotes
    ├── images/gallery/     Source photos for the gallery
    ├── scripts/            Gallery metadata, PageSpeed fetch, utilities
    └── styles/             Sass partials, per-page styles, and fonts
```

## Running it locally

```bash
npm install
```

```bash
npm run dev
```

The dev server uses stub Lighthouse numbers, so it doesn't need an API key. `exiftool-vendored` bundles ExifTool, so there's nothing else to install for the gallery.

To build the site and preview the result:

```bash
npm run build
```

```bash
npm run preview
```

A production build calls the PageSpeed Insights API. Without a `PSI_KEY`, the request may fail, and the Lighthouse panel is left out.

## Reuse

The code is here to learn from and borrow. The writing and photos are mine, so please don't republish them as your own.
