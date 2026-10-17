# Issues

Known problems and small cleanups found during a site review on 2026-10-13, updated after the plain HTML rebuild.

## Bugs

- [x] **Font preloads never render.** Pages passed `preloadFonts` to the Astro layout, which never forwarded it to the head, and the 404 page passed `["cormorant, noto-sans"]` as one string. (Fixed in the plain HTML rebuild: each page’s `fonts` list in its page comment becomes preload links.)
- [x] **Empty résumé sections.** Six variants listed plain strings instead of `key:` objects, so their Relevant Experience, Other Experience, and Projects entries rendered empty. (Fixed in the plain HTML rebuild.)
- [x] **Broken "Download PDF" links.** Six variants pointed at PDFs that don’t exist or had leading-slash paths. (Fixed in the plain HTML rebuild: the link only appears when the PDF exists, on 5 of the 13 résumés.)
- [x] **Legacy redirects point to a missing page.** `/web-development-projects` and `/projects` went to `/websites`, which doesn’t exist. (Fixed in the plain HTML rebuild: they go to `/code/`, and `/gallery` to `/photos/`, with trailing slashes.)
- [x] **Project links on the Code page and in the head:** wrong `source` for Little Peaks Pediatric Therapy, mixed `notebook.`/`notes.` domains, and an Atom type on an RSS feed.
- [x] **404 page read "pleaseemail me."** (Fixed in the plain HTML rebuild.)

## Cleanup

- [x] **Unused components, dependencies, and jampack config.** (Fixed in the plain HTML rebuild: none of them were ported.)
- [x] **Gallery sort comment is backwards.** (Fixed in the plain HTML rebuild: the comment is gone; [photos.mjs](photos.mjs) sorts newest first.)
- [x] **Old OSINT log page.** (Fixed in the plain HTML rebuild: not ported.)
- [x] **Committed image cache and slow builds.** `node_modules/.astro/` (about 1,450 processed gallery images) was committed. (Fixed in the plain HTML rebuild: removed, and builds no longer process images. Git history is still about 480 MB; rewriting it is optional.)
- [x] **Unused Bridgy Fed redirects.** (Fixed in the plain HTML rebuild: removed.)
- [ ] **Unreferenced résumé PDFs.** No résumé page links the customer-success, page-designer, support-specialist, writer-developer, or writer-editor PDFs in [site/static/resumes/](site/static/resumes/). They’re still public at their URLs. Keep them if you’ve sent those links out; otherwise remove them.
- [ ] **Old email address in résumé PDFs.** The site uses sam@samfeldstein.com, but every PDF in [site/static/resumes/](site/static/resumes/) shows an older address (samfeldstein@pm.me, or sam@samfeldstein.xyz in the support-specialist PDF). Re-export the ones you still use and delete the rest.
- [x] **Decide which résumé variants to keep.** (Résumé pages disabled on 2026-10-17 and kept in [_archive/resumes/](_archive/resumes/); see [ROADMAP.md](ROADMAP.md).)
- [x] **Web manifest colors.** (Cloth and paper colors since the book redesign.)
- [x] **Fallback font name mismatch.** (Gone with the book redesign: Noto Serif and its fallback are no longer used.)

## Content

- [ ] **Typo in the site description.** "Sam Feldstein is human being based in Denver, CO." is missing "a". It’s in `site.description` in [shared/facts.json](shared/facts.json) and in the home page comment in [site/index.html](site/index.html). Fix both, then run `node sync.mjs`.
- [ ] **Typo on Published Writing.** The description in the page comment of [site/published-writing/index.html](site/published-writing/index.html) reads "My publish writing". Fix it, then run `node sync.mjs`.
- [x] **Home footer wording.** ("Powered by Astro" replaced with a colophon on home and Code, in [shared/credit.html](shared/credit.html).)
- [ ] **Gallery image URLs changed.** Photos moved from `/_astro/*` to `/img/photos/*`. Image search will reindex them; old image links won’t resolve.
- [x] **Review the Code page portfolio.** (The list is now generated from public GitHub repositories by `projects.mjs`, with names approved in `projects.json`.)

## From the October 2026 audits (owner)

- [ ] **GitHub repo descriptions.** personal-site-astro says "built with Astro"; rss-feeds has a lowercase "rss". Update them on GitHub; consider renaming "Personal Site Astro" in [projects.json](projects.json).
- [ ] **Photo alt-text typos** (EXIF Description, then `node photos.mjs`): "it's head", "A group a people", "ocototillo with a mountains", "Robert's Western world", "Arches National Monument" (a National Park); two Barksdale's photos share the same alt text.
- [ ] **Presswork's structured data** names its founder as a bare Person; link it to `https://samfeldstein.xyz/#person` in the presswork repo.
- [ ] **Favicons** are still the old white square; a cloth-and-gilt icon would match the cover.
- [ ] **Cloudflare dashboard:** confirm Web Analytics auto-injection and Bot Fight Mode are off (the colophon says "No cookies, no trackers").

