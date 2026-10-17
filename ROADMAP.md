# Roadmap

Planned work that isn't a bug. Bugs and cleanups live in ISSUES.md.

## About the Author page

A new chapter (or back-matter page, as in a printed book) about Sam: a short bio, maybe a portrait from the photo collection, and contact links. Built from `book.css` like the other chapters, added to the contents on the home page and to the sitemap (sync does that automatically).

## Résumés from the Find a Job project

The 13 résumé pages are disabled (moved to `_archive/resumes/` on 2026-10-17). Résumés are now generated in the Find a Job project, so that project should be the source of truth.

- Link one résumé from Find a Job into this repo with `ln -s`, so it isn't copied by hand.
- If it should be on the site again, render it as a page from that file.
- A symlink only resolves where both projects sit side by side. Cloudflare builds from this repo alone, so a deployed page needs the file committed here (copied in by a script, or the symlink replaced at deploy time).
- The archived pages still use `shared/css/resume.css` and `resume-print.css`; reuse or delete them then.
- Also decide what happens to the old PDFs in `site/static/resumes/` (see ISSUES.md: old email address, unreferenced files).

## Shrink the repo

The site deploys about 81 MB of gallery WebPs (down from about 200 MB under Astro, which also shipped a full-size copy of every photo). Each Cloudflare deploy uploads only new or changed files, and old files simply aren't part of the new version, so there's nothing to purge there.

What is still large is the git repo, which every Cloudflare build clones: about 480 MB of history, mostly the old committed Astro image cache, plus 247 MB of source JPGs in `photos/`. Options, both the owner's call:

- Rewrite history to drop `node_modules/.astro/` (needs a force push; every other clone must be re-cloned).
- Keep the source JPGs outside the repo and point `photos.mjs` at that folder.

## Make samfeldstein.com the primary domain

The site is canonical at samfeldstein.xyz; samfeldstein.com should take over, with .xyz redirecting to it.

- In the repo: `url` and `allowedHosts` in `shared/facts.json` (sync then rewrites canonicals, Open Graph URLs, the JSON-LD `@id`s and the sitemaps), `site/robots.txt`, the test host in `test/check.test.mjs`, the `User-Agent` in `projects.mjs`, `README.md` and `CLAUDE.md`.
- On Cloudflare: add samfeldstein.com (and `www`) as a custom domain on the Worker, and a 301 redirect from every samfeldstein.xyz URL to the same path on .com (a Redirect Rule; `_redirects` can't match on host). Keep the .xyz registration so old links keep working.
- Afterwards: add the .com property in Search Console and submit the sitemap, update the Presswork structured-data link (see handoff), and update the GitHub repo homepage.
- Decide whether the subdomains (`notes`, `cookbook`, `shelftalkers`) move too. They're separate projects; the RSS link in `shared/head.html`, the contents links and the `_redirects` targets point at them, so update those if they do.
- The old résumé PDFs in `site/static/resumes/` name .xyz; leave them unless they're regenerated.
