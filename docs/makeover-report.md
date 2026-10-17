# The October 2026 makeover: report

Written 2026-10-17. Covers the rebuild of samfeldstein.xyz from Astro to plain HTML, and the redesign as an old book that followed, all on the branch `claude/hopeful-wozniak-oclsqe` (28 commits after `3007f99`). Sources: the git history, the plan (`plain-html-plan.md`, now historical), and the reviews and audits run during the work.

## Summary

The site ran on Astro with Sass, PostCSS, ESLint and an image pipeline whose cache was committed to git. Nothing on it used what Astro is good at: there were no content collections in use (only 13 unlinked résumés), and all code is written by Claude, so components and templating saved no one any work. It was rebuilt as plain HTML, CSS and JavaScript, following the Presswork rebuild, then redesigned as a book. The site now has no runtime dependencies and no framework, and every page scores 99 to 100 on mobile Lighthouse.

## Why

- **Astro's conveniences were for a human coder.** Claude writes and edits every file, so repetition costs nothing; what a plain site needs instead is protection against drift, which two small scripts provide.
- **No content system was being used.** The résumés were the only collection, unlinked from the site, and six of them rendered empty sections.
- **The build was heavy.** The committed image cache (`node_modules/.astro`, 1,453 files) grew the repo to about 480 MB, and every Cloudflare build cloned it.

## Phase 1: the port (port, don't redesign)

1. **Baseline.** The Astro site was built once into a gitignored `.reference/` folder.
2. **Plan and review.** The plan was reviewed by two subagents (platform, completeness) before any code. Their findings changed it: keep fonts at `/static/fonts/`, inline CSS as Astro did, use ExifTool rather than exifr (exifr sorted six photos differently), check print styles, fix the 404's skip link.
3. **Mechanics.** Each page started from Astro's rendered HTML. Sass was compiled once to CSS; scoped component styles became class selectors. `sync.mjs` and `check.mjs` came from Presswork and were adapted (inline CSS, nested shared blocks, per-page fonts).
4. **Images.** `photos.mjs` reproduces Astro's gallery from the photos' EXIF data. The first run reused the exact WebP files Astro had generated, so git stored no new image data.
5. **Verification.** Computed styles of every element were compared against the Astro build on all 18 pages, at 1280 and 390 px, light and dark, plus print for the résumés. Everything matched except two intended fixes. This found three real bugs: Astro's résumé pages loaded the print styles twice (and later rules depended on it), a `color-scheme` meta changed the résumé header color in dark mode, and the 404 page had read "pleaseemail me" because Astro's HTML compression ate a space. A browser audit and a script review followed; the review caught that `photos.mjs` would delete every WebP if run with no photos.

## Phase 2: the redesign as a book

- **Cover.** A cloth-bound cover in bottle-green buckram with a double gilt frame replaced the big outlined title.
- **Contents.** One contents page with dotted leaders to page numbers: chapters 1–3, then other sites and contact in lowercase roman.
- **Chapters.** Each inner page is a chapter with a running head and a "Chapter N" opener. Published Writing and Code share one list-of-works style. Photography is a justified mosaic with a full-screen `<dialog>` lightbox. The 404 page is an erratum slip.
- **End matter.** Every page ends with an epigraph page (a random quote) and a colophon page (typefaces, hosting, Lighthouse scores, imprint), from one shared block.
- **Type.** Only Cormorant Garamond, subset from the Google Fonts source with `pyftsubset`, keeping small caps, old-style figures and historical ligatures (Fontsource builds strip them), plus curly quotes, dashes, ↗ and the fleuron. Historical ligatures are kept to running prose, because they read as broken letters in names.
- **Color.** Aged paper, iron-gall ink, vermilion used sparingly, light and dark through `light-dark()`.
- **Code page projects.** Generated from public GitHub repositories on every build by `projects.mjs`, shown only once the owner approves each name in `projects.json`.
- **Small marks.** External links carry ↗ and email links an envelope, both announced to screen readers.
- **Work method.** Pages were restyled by three subagents in separate git worktrees, each owning its own files, then merged and reviewed together. The worktrees were created from the old `main`, so each agent first reset onto the branch; check the base when doing this again.

## Phase 3: audits

Five read-only subagents audited design, performance, accessibility, SEO and content, and code and build. Each finding was checked against the code before acting. Fixed:

- **Performance.** The prefetch rule matched the 87 full-size photo links (about 13 MB per Photos visit in Chromium); photo `sizes` overstated widths by about 1.7×; the width ladder had gaps; the fallback font had no metric overrides.
- **Accessibility** (axe found no violations; these were deeper). Visible photo titles were missing from link names (voice control); the lightbox didn't announce photo changes; the epigraph was an empty region without JavaScript; the dark vermilion and the ↗ mark were under contrast minimums; reduced motion didn't stop view transitions.
- **SEO and identity.** No `twitter:card`; WebP share image; old résumé, feed, blog and uses URLs returned 404; typos in two descriptions; white manifest colors. Person, Organization, WebSite and ProfilePage structured data now tie Sam Feldstein to Presswork Web Co., and Presswork is listed in the contents.
- **Build.** A page could lose its shared end matter without any check failing; `quote.js` restyled the wrong `<cite>`; the GitHub fetch had no timeout.
- **Design.** Stray punctuation in project entries, a 404 slip crowding the running head, a see-through lightbox, unbalanced attributions, an open en dash in the copyright, mixed leader weights and month formats.

Left for the owner are listed in `ISSUES.md` and `docs/handoff.md`.

## Results

| | Astro (`3007f99`) | Now |
|---|---|---|
| Dependencies | 10 runtime, 12 dev | 0 runtime, 3 dev (sharp, exiftool-vendored, wrangler; used by `photos.mjs` and for local preview) |
| Lockfile | 9,665 lines | 1,664 lines |
| Build step | `astro build` | none; the build only refreshes the project list and runs the checks |
| Committed image cache | 1,453 files in `node_modules/.astro` | none; 783 WebPs in `site/img/photos/` (87 photos × 9 widths, 91 MB) |
| Deployed gallery images | about 202 MB (included a full-size copy of each photo) | 91 MB |
| Gzipped HTML + CSS + JS, home / Code / Writing / Photos | 9.7 / 16.2 / 3.7 / 13.4 KB | 11.0 / 10.7 / 10.5 / 20.4 KB |
| Lighthouse mobile | not measured (the old site's live panel needed the API key) | 100 on home, Writing and Code; 99 on Photos (local runs) |
| Tests | none | 33 (`node --test test/*.test.mjs`) |

Page weights now include `quote.js` (5.8 KB gzipped, cached as immutable) on every page, because every page ends with the epigraph. Fonts are 107 KB on first visit (Cormorant Garamond regular and italic).

## What was lost

- **The old look.** Intentionally; the port first matched it exactly, then the redesign replaced it.
- **Automatic image handling.** Adding photos means running `photos.mjs` by hand.
- **The résumé pages.** Disabled and kept in `_archive/resumes/`; their URLs redirect to the matching chapter.
- **Automatic CSS scoping.** Styles are organized by hand (`book.css` plus a few page files).

## Lessons

- **Measure the port against the old build.** Comparing computed styles found bugs that reading the code would not (the doubled print stylesheet).
- **Plan, then have reviewers attack the plan.** Two reviews before coding changed five decisions.
- **Subagents in worktrees need a checked base,** and each should own a disjoint set of files.
- **Don't fade in the hero.** An opacity animation on the cover made Lighthouse find no LCP and score performance 0.
- **Fontsource strips OpenType features.** Subset from the source when small caps or old-style figures matter.
- **Generated content needs an approval step** when it carries the owner's name in public (`projects.json`).
- **Run scripts from a known directory.** Two screenshots landed in the repo from scripts run in the wrong working directory.
