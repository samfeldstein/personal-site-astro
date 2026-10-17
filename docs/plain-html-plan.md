# Plan: rebuild samfeldstein.xyz as plain HTML

Branch: `claude/hopeful-wozniak-oclsqe`. `main` stays live until cutover. Model: the Presswork rebuild (`samfeldstein/presswork`, `docs/plain-html-plan.md`, `docs/astro-to-plain-html-report.md`, `docs/static-site-stack-skill.md`).

## Rule for the whole port

**Port, don't redesign.** Markup, CSS, fonts and copy move over as they render today. Only the mechanics change. Exceptions are the bugs already logged in `ISSUES.md` (listed under Fixes below).

## Is Astro worth keeping?

No. What it does here, and what replaces it:

| Astro does | Plain replacement |
|---|---|
| Layout, head tags, skip link | `shared/head.html`, `shared/skip-link.html`, written into each page between `<!-- shared:... -->` markers by `sync.mjs` |
| `config.mjs` (title, email, location) | `shared/facts.json`; `check.mjs` verifies the email and location everywhere |
| Sass partials, scoped component styles | Plain CSS files in `site/css/`, compiled once from the current Sass and cleaned up; component scoping becomes class selectors |
| `@astrojs/sitemap` | `sync.mjs` writes `sitemap-index.xml` and `sitemap-0.xml` (same names) |
| `prefetchAll` | Speculation Rules block plus the small `rel="prefetch"` fallback from Presswork's `head.html` |
| Gallery: `import.meta.glob`, ExifTool, `<Image>` at 7 widths | `photos.mjs`, run by hand when photos change: reads EXIF title/description/date, writes WebP widths into `site/img/photos/`, and writes the gallery markup into `site/photos/index.html` between markers. Only missing files are generated. The first run reuses the exact WebP files Astro already made, so nothing is re-encoded and git stores no new image data |
| PageSpeed panel fetched on every build | `lighthouse.mjs`, run by hand: calls the PageSpeed Insights API and writes the numbers into the home page between markers |
| Résumé content collection (13 YAML files + `resume.js`) | Static HTML pages at the same URLs, rendered once from the fixed Astro source. The content is frozen; edits go into the HTML |
| Quote generator component | `site/js/quote.js` (ES module) plus `site/js/quotes.js` (data) |
| Viewport-height inline script | Same script, as a module |
| Asset hashing | `sync.mjs` adds `?v=` content hashes to CSS and JS links; `_headers` caches `/css/*` and `/js/*` as immutable |

Remaining dependencies: `sharp` and `exifr` as devDependencies, used only by `photos.mjs` (resizing images is not something the platform can do). Everything else is dependency-free Node. Wrangler is run with `npx`.

## Target layout

```
site/                      deployed as is (wrangler assets directory)
  index.html  code/  photos/  published-writing/  resumes/<13 ids>/  404.html
  css/   base.css (reset, fonts, tokens, view transition) + one file per page type
  js/    quote.js quotes.js home.js
  fonts/ moved from /static/fonts/
  img/photos/  gallery WebPs
  static/resumes/*.pdf  static/images/*  (same URLs as today; may be linked externally)
  favicons, site.webmanifest, robots.txt, _headers, _redirects, sitemaps
shared/   head.html skip-link.html facts.json
photos/   source JPGs (moved from src/images/gallery/, not deployed)
sync.mjs check.mjs photos.mjs lighthouse.mjs test/
wrangler.jsonc   assets.directory -> ./site/
```

## Hosting

Cloudflare Workers static assets, built from GitHub by Workers Builds. `package.json` keeps a `build` script, now `node sync.mjs --check && node check.mjs`, so the existing dashboard build command (`npm run build`) runs the checks and fails the deploy on drift, with no dashboard change. `wrangler.jsonc` points at `./site/`. No Worker script (no forms). Old Astro files and `node_modules/.astro` (1,453 committed cache files) are removed from the branch.

## Fixes taken from ISSUES.md

- Font preloads: each page preloads the fonts it lists (they never rendered under Astro).
- Résumés: plain-string entries render (six variants were empty); Download PDF links only where the PDF exists, no leading-slash paths.
- `_redirects`: `/web-development-projects` and `/projects` go to `/code/`; Bridgy Fed rules removed.
- Web manifest colors match dark mode via neutral values.
- Unused components, dependencies, `jampack.config.js`, `_osint-log.astro` are not ported.

Not touched: the Code page portfolio content, résumé PDFs with the old email (both need the owner).

## Steps

1. Baseline: `astro build` into gitignored `.reference/dist` (done).
2. Fix the résumé bugs in the Astro source and rebuild the baseline, so the port starts from correct output.
3. Skeleton: `site/`, fonts, favicons, `static/`, `wrangler.jsonc`, `_headers`, `_redirects`.
4. CSS: compile each page's Sass and component styles once; split into `base.css` + page files.
5. Shared parts and scripts: `shared/*`, `sync.mjs`, `check.mjs` (adapted from Presswork's), tests.
6. Pages: 404, published-writing, code, home, photos, résumés.
7. Scripts: quote generator and viewport fix as modules.
8. `photos.mjs` (reuses Astro's WebPs on the first run), `lighthouse.mjs`.
9. Compare: computed styles and layout of every element against `.reference/dist` at 1280px and 390px in Playwright, light and dark; interactions (skip link, quote, view transitions).
10. Peer review by subagents; fix; docs (`README.md`, `CLAUDE.md`, `ISSUES.md`).
11. Owner checks on the Workers Builds preview URL: Lighthouse, a phone. Then merge to `main`.

## Risks

- Flattening scoped styles can change specificity. Step 9 diffs every element.
- Committing gallery WebPs: same bytes as the committed Astro cache, so git dedupes them.
- `npm ci` on Cloudflare installs `sharp` for nothing; acceptable (seconds).

## Changes after review (carried out 2026-10-17)

- CSS is inlined into each page by `sync.mjs` (as Astro did), from `shared/css/`, not linked from `site/css/`.
- Fonts stay at `/static/fonts/` (immutable cache, unchanged URLs). Photos are cached 30 days, not immutable.
- No `color-scheme` meta: the résumé pages never opted into dark mode, and the meta changed their header color.
- Résumé pages load `resume.css` then `resume-print.css`, matching Astro, which included the print styles twice.
- `photos.mjs` uses ExifTool (exifr sorted six photos differently), and points `src` at the largest srcset width instead of a full-size copy.
- The footer credit ("Plain HTML, CSS, and JavaScript") is a shared block on home and Code.
- Fixed while porting: the 404 page's missing space ("pleaseemail me") and missing skip-link target; résumé links to `/code` and `/published-writing` now end in `/`.
- Verified: computed styles of every element match the Astro build on all 18 pages at 1280 and 390px, light and dark, plus print for the résumés, except the intended footer and 404 changes. A browser audit found no console errors or failed requests, and the scripts were reviewed and tested.
