# Handoff

Last updated 2026-10-17. Read this, then `CLAUDE.md`, before working on the site.

## Where things stand

- **Branch.** All work is on `claude/hopeful-wozniak-oclsqe`. `main` is still the old Astro site and is what's live at samfeldstein.xyz. Nothing has been merged or deployed.
- **State.** The site is the plain HTML rebuild, redesigned as an old book (see `docs/makeover-report.md`). The five audits are done and their clear-cut findings are fixed. Checks and all 33 tests pass.
- **Preview.** `git checkout -- site/code/index.html && git pull && npm install && npx wrangler dev`. `node projects.mjs` rewrites `site/code/index.html` every run, so discard or commit it before the next pull.

## Before merging to main

1. **Preview on Cloudflare.** Check whether Workers Builds built this branch, or run `npx wrangler versions upload`. The first Cloudflare build is also the first time `projects.mjs` fetches from GitHub on Cloudflare's machines; check that the Code page lists the approved projects.
2. **Owner checks.** Lighthouse on the preview, a real phone, the lightbox with a keyboard, and a screen reader pass if possible.
3. **Cloudflare dashboard.** Confirm Web Analytics auto-injection and Bot Fight Mode are off, so the colophon's "No cookies, no trackers" stays true. The build command stays `npm run build`.
4. **Merge,** then update the Lighthouse scores from the live site: `node lighthouse.mjs <score> "<blocking>" "<speed index>" "<tti>"` (current numbers are from a local run).

## Waiting on the owner

These need decisions or changes outside the repo; they're also in `ISSUES.md`.

- **GitHub repo descriptions.** "My personal website, built with Astro" (personal-site-astro) is out of date, and "Collection of rss feeds" has a lowercase "rss". The display name "Personal Site Astro" could be renamed in `projects.json`. Project dates are repo creation dates, so recent repos for older work show recent dates.
- **Photo captions (EXIF, in the photo editor, then `node photos.mjs`).** Alt-text typos: "it's head", "A group a people", "ocototillo with a mountains", "Robert's Western world", "Arches National Monument" (a National Park). Two Barksdale's photos share identical alt text.
- **Presswork's own structured data.** presswork.dev names its founder as a bare `Person`. Linking it to `{"@id": "https://samfeldstein.xyz/#person", "url": "https://samfeldstein.xyz/"}` would complete the connection from that side. That's in the presswork repo.
- **Favicons.** Still the old white rounded square; a cloth-and-gilt icon would match the cover.
- **Contents numbering.** Chapters use 1–3, other links continue in lowercase roman (iv–viii). The design audit noted roman usually comes before arabic in a book. The owner chose the current scheme; revisit only if asked.
- **Gallery row size.** The design audit suggested smaller rows so three landscapes fit per row; kept larger because the owner asked for thumbnails at least twice the old size.

## Open question: Git-connected builds or `wrangler deploy`?

Analyzed 2026-10-17; the owner hasn't decided.

- **Keep Workers Builds (current; recommended).** Every push to `main` deploys, with the checks run first (`npm run build`), so nothing unchecked goes live. The project list refreshes from GitHub on each build, other branches get preview builds, and changes made from a Claude cloud session deploy without anyone's laptop. The costs: each build clones the roughly 480 MB repo history and installs sharp and exiftool-vendored, which the build never uses, and a docs-only push to `main` also deploys.
- **Direct `npx wrangler deploy`.** This is faster and deploys exactly what is on disk. But it needs `wrangler login` on the machine, so cloud sessions can't deploy. It can ship uncommitted or unchecked work unless a script runs the checks first. The project list only updates when someone deploys. Presswork deploys this way, but it has a Worker and secrets to manage; this site doesn't.
- **To make builds cheaper without switching:** rewrite history to drop the old image cache (see ROADMAP), and keep sharp and exiftool-vendored out of the build install. They are only needed for `photos.mjs`, so they could move to a separate `package.json` or be installed on demand.

## Optional follow-ups

- A Content-Security-Policy header (needs hashes for the two inline head scripts, which `sync.mjs` would compute).
- Redirects for the old `/_astro/*` gallery image URLs (87 rules), only for old image-search hits.
- A scheduled rebuild (or a GitHub Action) so new repos show up as waiting without a push, and a notification when one is waiting.
- Re-encode the few very heavy photos (`the-getty-2`, `ocotillo-sideways`) at a lower WebP quality. Delete their WebPs and rerun `photos.mjs`.
- Rewrite git history to drop the old Astro image cache (about 480 MB); needs a force push.
- The roadmap: an About the Author page, and résumés from the Find a Job project (`ROADMAP.md`).

## How the work was done

- **Plan, then build.** Plan before code, reviewed by subagents from separate angles; check every finding against the code before acting.
- **Verify in a browser.** Playwright with `/opt/node-tools/node_modules/playwright/index.mjs` and Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Lighthouse via `npx --yes lighthouse@12.8.2` with `CHROME_PATH` set. These paths are for the cloud container.
- **Subagents** worked in git worktrees on disjoint files; check that a worktree starts from this branch, not `main`.
- **Scratch files** go outside the repo; write screenshots with absolute paths.
