# Issues

Known problems and small cleanups found during a site review on 2026-10-13.

## Bugs

- [ ] **Font preloads never render.** Pages pass `preloadFonts` to [Base.astro](src/layouts/Base.astro), but Base only forwards `title` and `description` to [Head.astro](src/components/Head.astro), so no `<link rel="preload">` tags make it into the HTML. Forward `preloadFonts` from Base to Head. Separately, [404.astro](src/pages/404.astro) passes `["cormorant, noto-sans"]`, which is one string instead of two.
- [ ] **Empty résumé sections.** [resumes/[id].astro](src/pages/resumes/[id].astro) looks entries up with `experience.key` and `project.key`. Six variants list plain strings instead of `key:` objects: web-developer, wordpress-developer, journalist, internet-researcher, freelance-writer, and writing-tutor. On those pages, the Relevant Experience, Other Experience, and Projects entries render empty. Either convert those YAML files to the `- key: ...` form, or make the page accept both forms.
- [ ] **Broken "Download PDF" links.** The link is built from each variant's `printUrl`, and six of them don't match a file in [public/static/resumes/](public/static/resumes/):
  - `coalition-csa` (customer-success), `developer-writer` (writer-developer), and `theater-staff` have no matching PDF.
  - `/freelance-writer`, `/writing-tutor`, and `/web-development-tutor` have a leading slash, which produces paths like `sam-feldstein-/freelance-writer-resume.pdf`.
- [ ] **Legacy redirects point to a missing page.** [public/_redirects](public/_redirects) sends `/web-development-projects` and `/projects` to `/websites`, which doesn't exist. Point them at `/code`.
- [x] **Project links on the Code page and in the head:**
  - In [code.astro](src/pages/code.astro), Little Peaks Pediatric Therapy's `source` points to the shelf-talkers repo.
  - The Code page links to `notebook.samfeldstein.xyz`, while the home page uses `notes.samfeldstein.xyz`. Use one domain everywhere.
  - [Head.astro](src/components/Head.astro) has an alternate feed link to `notebook.samfeldstein.xyz/feed.xml` with type `application/atom+xml`. The notebook's feed is RSS (`application/rss+xml`).

## Cleanup

- [ ] **Unused components** in [src/components/](src/components/): Date, EleventyIcon, FigmaIcon, Icon, MobileMenu (which imports a `Menu.astro` that doesn't exist), PortfolioList, Pre, RssIcon, SiteFooter, SvgIcon, Tags, and WordPressIcon.
- [ ] **Unused dependencies:** `exif-parser`, `exif-reader`, `exifr`, `exifreader`, `markdown-it`, `sanitize-html`, and `@astrojs/rss`. The gallery only uses `exiftool-vendored`. [jampack.config.js](jampack.config.js) is also left over, since jampack isn't installed or run.
- [ ] **Gallery sort comment is backwards.** [get-gallery-images.js](src/scripts/get-gallery-images.js) says "oldest to newest," but the sort puts the newest photos first.
- [ ] **Old OSINT log page.** [src/pages/_osint-log.astro](src/pages/_osint-log.astro) is disabled by its underscore prefix and links to `/files/*.pdf` certificates that aren't in the repo. Delete it.
- [ ] **Unreferenced résumé PDFs.** No variant links to the page-designer, support-specialist, writer-editor, or customer-success PDFs. They're still public at their URLs. Keep them if you've sent those links out; otherwise remove them.
- [ ] **Old email address in résumé PDFs.** The site now uses sam@samfeldstein.com, but every PDF in [public/static/resumes/](public/static/resumes/) still shows an older address. The support-specialist PDF has sam@samfeldstein.xyz, and the other nine have samfeldstein@pm.me. Re-export the ones you still use and delete the rest.
- [ ] **Committed image cache and slow builds.** `node_modules/.astro/` is committed so Cloudflare can reuse processed gallery images instead of regenerating them (87 photos at seven widths, about 600 images) on every build. That's about 1,450 files, including variants for 10 source images that are no longer in the gallery, and it has grown the git history to roughly 930 MB, which Cloudflare has to clone on every build. Worse, if Cloudflare installs dependencies with a clean install (`npm ci`), it deletes `node_modules/` before building, cache included. In that case, every build reprocesses every photo anyway, and the committed cache only adds clone time.
  - First, check the timestamps in a Cloudflare build log to see whether the time goes to cloning or to image generation.
  - Likely fix: stop committing `node_modules/.astro/`, remove it from git, and keep processed images between builds with Cloudflare's build cache instead. Confirm that the build cache actually preserves that folder before relying on it.
  - Optional: rewrite history to shrink the repo once the cache is no longer committed.
- [ ] **Unused Bridgy Fed redirects.** The two `/.well-known/*` rules at the bottom of [public/_redirects](public/_redirects) forward fediverse lookups to fed.brid.gy. Remove them, since Bridgy Fed isn't in use.
- [ ] **Web manifest colors.** [public/site.webmanifest](public/site.webmanifest) uses white for both `theme_color` and `background_color`, which doesn't match dark mode.

## Content

- [ ] **Review the Code page portfolio.** Some of the projects on [code.astro](src/pages/code.astro) aren't very interesting to highlight. The page currently lists Little Peaks Pediatric Therapy, Shelf Talker Generator, The Simplest Writing Tracker, Personal Cookbook, Regreen Big Bend, Postoley Dance Ensemble, Digital Notebook, Prairie Rose Arena, and Pairings. Decide between:
  - Replacing the project list with a link to GitHub.
  - Trimming it to the projects worth featuring.
  - **Generating the list from GitHub,** so the page never needs manual updates. At build time, fetch public repos from the GitHub API (`https://api.github.com/users/samfeldstein/repos`), keep the ones tagged with a topic like `portfolio`, and render each one from its name, description, homepage URL, and topics. Featuring a project then just means adding the topic on GitHub. Things to work out:
    - Exclude the `samfeldstein/samfeldstein` repo. It's the GitHub profile README, not a project. A topic filter would skip it as long as it isn't tagged, but exclude it by name too, in case the filter changes later.
    - The page only refreshes when the site rebuilds. A scheduled Cloudflare deploy hook, for example once a day, would keep it current without manual pushes.
    - Client sites without a public repo (Regreen Big Bend, Postoley Dance Ensemble, and Prairie Rose Arena) would drop off unless they get a repo or a small manual list alongside the fetched ones.
    - Unauthenticated API calls are limited to 60 per hour, which is plenty for builds. Pinned repos would need the GraphQL API and a token.
