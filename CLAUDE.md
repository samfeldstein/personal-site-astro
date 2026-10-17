# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sam Feldstein’s personal site (samfeldstein.xyz): plain HTML, CSS and JavaScript (no framework, no build step), served as Cloudflare Workers static assets. No Worker script, no forms. Ported from Astro in October 2026, following the Presswork rebuild (`~/presswork`); the plan is `docs/plain-html-plan.md`, but where it differs from the code, the code is right. Open items are in `ISSUES.md`.

## Commands

All scripts are dependency-free Node except `photos.mjs` (`sharp`, `exiftool-vendored`; `npm install` first).

- `node sync.mjs`: writes the shared parts into every page, inlines CSS, stamps script links, regenerates the sitemaps (`--check` writes nothing and exits 1 if anything is out of date)
- `node check.mjs`: fails if the site has drifted or something is broken
- `node --test test/*.test.mjs`: tests that `check.mjs` catches what it should
- Before any commit: `node sync.mjs && node check.mjs && node --test test/*.test.mjs`
- `npx wrangler dev`: local preview (`npm run dev:phone` listens on the local network)
- Deploys: Cloudflare Workers Builds runs `npm run build` (`sync.mjs --check` + `check.mjs`) on every push, so any drift fails the deploy.
- **New year:** the copyright year comes from sync (`{{year}}`). `sync.mjs --check` still accepts last year's, so deploys keep working on January 1; run `node sync.mjs` and commit early in the year.

## Architecture

- **`site/`** is deployed as is (`wrangler.jsonc`: `assets.directory` `./site/`, `not_found_handling` `404-page`). Pages: `index.html`, `code/`, `photos/`, `published-writing/`, `404.html`, and 13 résumés under `resumes/<id>/`. The résumés aren’t linked from the site; their content is frozen, ported as static HTML, and edited directly in the HTML. Pages use root-relative paths, so they need a server.
- **`shared/`** holds the single sources: `head.html`, `skip-link.html`, `copyright.html`, `credit.html` (the footer line on home and Code), `facts.json` (site name and description, emails, `allowedHosts`, `sizeBudgetKB`, `allowedChars`) and `css/`. Each page starts with a `<!-- page: {...} -->` comment (`title`, `description`, `css` list, `fonts` to preload, `noindex`). `sync.mjs` writes the shared blocks between `<!-- shared:... -->` markers, inlines `base.css` plus the page’s `css` list into one `<style>` (comments stripped), adds `?v=` hashes to `/js/` links, and writes `sitemap-index.xml` and `sitemap-0.xml`. **Never edit text between `shared:` markers**; edit `shared/` or the page comment and run sync.
- **Styling**: `shared/css/base.css` (reset, view transition) and one file per page type (`home`, `code`, `default`, `writing`, `photos`, `404`, `resume`, `resume-print`). Each page file carries its own `@font-face` rules and tokens. Colors are `light-dark()` tokens.
- **Fonts** are self-hosted under `site/static/fonts/` with `unicode-range` subsets and `size-adjust` local fallbacks. They’re cached as immutable, so a changed font needs a new file name. `check.mjs` fails on any character outside the shipped ranges unless it’s in `allowedChars` (© – — ’, which fall back to local fonts, as before the port).
- **Gallery**: source JPGs in `photos/` (not deployed). After adding, removing or re-captioning a photo, run `npm install`, then `node photos.mjs`: it reads Title, Description (the alt text) and CreateDate with ExifTool, generates missing WebPs in `site/img/photos/`, deletes orphans, and rewrites the gallery between `<!-- gallery -->` markers in `site/photos/index.html`, newest first. Then sync, check, commit.
- **Lighthouse panel**: `PSI_KEY=... node lighthouse.mjs`, run by hand after a deploy, writes the home page panel between `<!-- lighthouse -->` markers. Then sync, commit, deploy. The panel is empty until the first run.
- **Scripts**: `site/js/quote.js` is an ES module holding the quotes array and the generator (home and Code pages; shows the first quote on localhost). Script files load as `type="module"`; classic inline scripts (the prefetch fallback in `head.html`) are wrapped in a self-calling function. `check.mjs` enforces both.
- **`check.mjs`** verifies sync is current, one `<h1>` and `<main id="main-content">` per page, unique ids and id references, alt text, links and asset paths (page links end in `/`), CSS syntax, emails against `facts.json`, font coverage, robots.txt, no moving masks, module scripts, no hosts outside `allowedHosts`, and the gzipped size budget.
- **Caching and URLs**: `site/_headers` (fonts and `/js/` immutable, images shorter) and `site/_redirects` (old URLs to `/code/` and `/photos/`).

## Rules

- **Port, don’t redesign.** Markup, CSS, fonts and copy stay as they rendered under Astro unless the owner asks for a change.
- **No third-party hosts.** Nothing loads from a host outside `allowedHosts`; plain `<a>` links to other sites are fine.
- **Comments:** almost none in shipped CSS and JS. Keep the structural markers (`<!-- page: -->`, `<!-- shared:... -->`, `<!-- gallery -->`, `<!-- lighthouse -->`). Don’t add explanatory comments.
- Git history is still about 480 MB from the old committed Astro image cache; rewriting it is optional and the owner’s call.
