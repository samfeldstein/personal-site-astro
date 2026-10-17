#!/usr/bin/env node
/*
  sync.mjs: keeps the parts every page shares identical, and writes the sitemaps.
  Adapted from the Presswork site (samfeldstein/presswork).

  Each page has marker comments:

    <!-- page: {"title": "Code", "description": "...", "css": ["code"], "fonts": ["victor-mono"]} -->
    <!-- shared:head --> ... <!-- /shared:head -->
    <!-- shared:skip-link --> ... <!-- /shared:skip-link -->

  and optionally <!-- shared:copyright --> and <!-- shared:credit --> blocks.
  With --check, last year's copyright year still counts as up to date, so a
  deploy doesn't fail on January 1; the next sync writes the new year.

  This script rewrites what is between the markers from shared/*.html and
  shared/facts.json. Edit the shared files (or the page comment), never the
  text between the markers. It also adds a ?v= content hash to every /js/
  link, and regenerates site/sitemap-0.xml and site/sitemap-index.xml.

  The page comment takes: title (the site name is added), description,
  css (files in shared/css/, inlined in a <style> after base.css, without
  comments), fonts (files in site/static/fonts/ to preload), noindex.

  Usage:
    node sync.mjs            write changes
    node sync.mjs --check    write nothing; exit 1 if anything is out of date
*/
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, resolve, dirname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const REQUIRED = ["head", "skip-link"];
const OPTIONAL = ["copyright", "credit"];

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Every .html file under root, as { file, path } (path is the page's URL path). */
export function listPages(root) {
  const pages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith(".html")) {
        const rel = relative(root, full).split(sep).join("/");
        const path = rel === "index.html" ? "/" : rel.endsWith("/index.html") ? "/" + rel.slice(0, -"index.html".length) : "/" + rel;
        pages.push({ file: full, path });
      }
    }
  };
  walk(root);
  return pages;
}

export function readPageMeta(html, label = "page") {
  const m = html.match(/<!--\s*page:\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`${label}: missing the <!-- page: {...} --> comment`);
  let meta;
  try {
    meta = JSON.parse(m[1]);
  } catch (e) {
    throw new Error(`${label}: the page comment is not valid JSON (${e.message})`);
  }
  if (!meta.title) throw new Error(`${label}: the page comment needs a "title"`);
  return meta;
}

const lookup = (name, ctx) => {
  let v = ctx;
  for (const key of name.split(".")) v = v?.[key];
  if (v === undefined) throw new Error(`unknown placeholder {{${name}}}`);
  return v;
};

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n{3,}/g, "\n\n").trim();

function inlineCss(names, shared) {
  return ["base", ...names].map((n) => stripComments(readFileSync(join(shared, "css", `${n}.css`), "utf8"))).join("\n");
}

function renderTemplate(tpl, ctx, meta, shared) {
  const out = [];
  for (let line of tpl.replace(/\n$/, "").split("\n")) {
    const flag = line.match(/^\?(noindex|indexed) /);
    if (flag) {
      if ((flag[1] === "noindex") !== Boolean(meta.noindex)) continue;
      line = line.slice(flag[0].length);
    }
    const list = line.match(/^(\s*)\{\{(fonts|css)\}\}\s*$/);
    if (list) {
      const [, indent, kind] = list;
      if (kind === "css") {
        out.push(`${indent}<style>\n${inlineCss(meta.css ?? [], shared)}\n</style>`);
        continue;
      }
      for (const name of meta.fonts ?? []) {
        out.push(`${indent}<link rel="preload" href="/static/fonts/${name}.woff2" as="font" type="font/woff2" crossorigin>`);
      }
      continue;
    }
    out.push(line.replace(/\{\{([\w.]+)\}\}/g, (_, name) => esc(lookup(name, ctx))));
  }
  return out.join("\n");
}

function replaceBlock(html, name, content) {
  const re = new RegExp(`(<!-- shared:${name} -->)[\\s\\S]*?(<!-- /shared:${name} -->)`);
  if (!re.test(html)) return null;
  return html.replace(re, (_, open, close) => `${open}\n${content}\n${close}`);
}

function stampAssets(html, root) {
  return html.replace(/\b(href|src)="(\/(?:css|js)\/[^"?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?"/g, (whole, attr, path) => {
    const file = join(root, path);
    if (!existsSync(file)) return whole;
    const hash = createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8);
    return `${attr}="${path}?v=${hash}"`;
  });
}

/** Build the new text for every page and the sitemaps. Returns { changed, pages, facts }. */
export function sync({ root, shared, write = true }) {
  const facts = JSON.parse(readFileSync(join(shared, "facts.json"), "utf8"));
  const templates = Object.fromEntries(
    [...REQUIRED, ...OPTIONAL].map((b) => [b, readFileSync(join(shared, `${b}.html`), "utf8")]),
  );
  const changed = [];
  const pages = [];

  const save = (file, text) => {
    const old = existsSync(file) ? readFileSync(file, "utf8") : null;
    if (old === text) return;
    changed.push(file);
    if (write) writeFileSync(file, text);
  };

  for (const { file, path } of listPages(root)) {
    const label = relative(root, file);
    let html = readFileSync(file, "utf8");
    const meta = readPageMeta(html, label);
    const now = new Date().getFullYear();
    const shown = Number(html.match(/<!-- shared:copyright -->[\s\S]*?(\d{4})\D*<!-- \/shared:copyright -->/)?.[1]);
    const year = !write && (shown === now || shown === now - 1) ? shown : now;
    const ctx = {
      ...facts,
      title: meta.title,
      typefaces: meta.typefaces ?? "",
      fullTitle: `${meta.title} | ${facts.site.title}`,
      description: meta.description ?? facts.site.description,
      url: new URL(path, facts.site.url).href,
      year: String(year),
    };
    for (const b of [...REQUIRED, ...OPTIONAL]) {
      const next = replaceBlock(html, b, renderTemplate(templates[b], ctx, meta, shared));
      if (next === null) {
        if (REQUIRED.includes(b)) throw new Error(`${label}: missing the <!-- shared:${b} --> ... <!-- /shared:${b} --> markers`);
        continue;
      }
      html = next;
    }
    html = stampAssets(html, root);
    save(file, html);
    pages.push({ file, path, meta, url: ctx.url, description: ctx.description });
  }

  const urls = pages.filter((p) => !p.meta.noindex).map((p) => p.url).sort();
  const xml = (body) => `<?xml version="1.0" encoding="UTF-8"?>${body}\n`;
  save(
    join(root, "sitemap-0.xml"),
    xml(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${esc(u)}</loc></url>`).join("")}</urlset>`),
  );
  save(
    join(root, "sitemap-index.xml"),
    xml(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${esc(facts.site.url)}/sitemap-0.xml</loc></sitemap></sitemapindex>`),
  );

  return { changed, pages, facts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dry = process.argv.includes("--check");
  try {
    const { changed } = sync({ root: resolve(here, "site"), shared: resolve(here, "shared"), write: !dry });
    for (const f of changed) console.log(`${dry ? "out of date" : "updated"}: ${relative(here, f)}`);
    if (!changed.length) console.log("sync: everything is up to date");
    if (dry && changed.length) process.exit(1);
  } catch (e) {
    console.error(`sync: ${e.message}`);
    process.exit(1);
  }
}
