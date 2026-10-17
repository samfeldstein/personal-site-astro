#!/usr/bin/env node
/*
  check.mjs: fails when the site has drifted or something is broken.
  No dependencies. Run it (after sync.mjs) before every deploy; the Cloudflare
  build runs it too (npm run build). Adapted from samfeldstein/presswork.

  What it checks:
    - sync is up to date: shared parts, sitemaps (runs sync without writing)
    - each page: lang, one <h1>, one <main id="main-content">, unique ids,
      <img> alt text, a title and description
    - every link and asset path resolves to a real file (in pages and CSS),
      page links end in "/", and #fragments point at a real id
    - label for / aria-labelledby / aria-describedby / aria-controls values
      point at ids that exist on the same page
    - CSS (files and inline <style>) has balanced braces and no unterminated
      comments or strings
    - every email address on the site is one of facts.json "emails"
    - every character shown on the page is covered by the page's @font-face
      unicode-ranges (or listed in facts.json "allowedChars": characters that
      fall back to a local font on purpose)
    - robots.txt points at a sitemap that exists
    - no mask or mask-image on an animated rule or inside @keyframes (a moving
      mask is drawn in software in Firefox)
    - every script file is loaded as a module (type="module"), every classic
      inline script runs inside a self-calling function, and
      no script, stylesheet, image or form points at a host outside facts.json
      "allowedHosts" (plain <a> links to other sites are fine)
    - each page's gzipped HTML (with its inline CSS) + linked JS stays within its budget in
      facts.json "sizeBudgetKB" (a "default" and optional per-path overrides)

  Usage: node check.mjs [--root site] [--shared shared]
*/
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { sync } from "./sync.mjs";

const here = dirname(fileURLToPath(import.meta.url));

const ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", copy: "©", reg: "®",
  trade: "™", mdash: "—", ndash: "–", hellip: "…", lsquo: "‘", rsquo: "’",
  ldquo: "“", rdquo: "”", middot: "·", times: "×", bull: "•", shy: "­",
  thinsp: " ", deg: "°",
};

/** Remove comments, and the insides of <script> and <style>; keep JSON-LD for the price check. */
function simplify(html) {
  const ld = [];
  let s = html.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, body) => {
    if (/application\/ld\+json/.test(attrs)) ld.push(body);
    return `<script${attrs}></script>`;
  });
  const styles = [];
  s = s.replace(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, body) => {
    styles.push(body);
    return `<style${attrs}></style>`;
  });
  return { markup: s, ld, styles };
}

const TAG = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s=\/"'>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return attrs;
}

function* tags(markup) {
  let m;
  TAG.lastIndex = 0;
  while ((m = TAG.exec(markup))) yield { name: m[1].toLowerCase(), attrs: parseAttrs(m[2]), index: m.index };
}

function visibleText(markup) {
  const body = markup.replace(/^[\s\S]*?<body\b[^>]*>/i, "");
  return body.replace(/<[^>]*>/g, " ");
}

function decode(text, problems, label) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, ref) => {
    if (ref[0] === "#") {
      const code = ref[1].toLowerCase() === "x" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return String.fromCodePoint(code);
    }
    if (!(ref in ENTITIES)) {
      problems.push(`${label}: unknown entity ${all} (add it to ENTITIES in check.mjs)`);
      return "";
    }
    return ENTITIES[ref];
  });
}

function fontRanges(css) {
  const ranges = [];
  for (const m of css.matchAll(/unicode-range:\s*([^;]+);/g)) {
    for (const part of m[1].split(",")) {
      const [a, b] = part.trim().replace(/^U\+/i, "").split("-");
      ranges.push([parseInt(a, 16), parseInt(b ?? a, 16)]);
    }
  }
  return ranges;
}

/** Structural problems in a stylesheet: unbalanced braces, an unterminated comment or string. */
export function cssProblems(css) {
  const found = [];
  const line = (index) => css.slice(0, index).split("\n").length;
  let depth = 0;
  let lastOpen = -1;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      if (end === -1) return [...found, `unterminated comment starting on line ${line(i)}`];
      i = end + 1;
    } else if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== ch && css[j] !== "\n") j += css[j] === "\\" ? 2 : 1;
      if (css[j] !== ch) return [...found, `unterminated string starting on line ${line(i)}`];
      i = j;
    } else if (ch === "{") {
      if (depth === 0) lastOpen = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth < 0) return [...found, `unmatched "}" on line ${line(i)}`];
    }
  }
  if (depth > 0) found.push(`unclosed "{" (the block opened on line ${line(lastOpen)} never ends)`);
  return found;
}

/** Firefox draws a moving mask in software; flag a mask on anything animated (or inside @keyframes). */
export function maskProblems(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  const root = { prelude: "", parent: null, animated: false, masks: [] };
  const frames = [];
  let frame = root;
  let buf = "";
  let paren = 0;
  let line = 1;
  let bufLine = 1;
  const declaration = () => {
    const m = /^\s*([-\w]+)\s*:\s*([\s\S]*?)\s*$/.exec(buf);
    if (m) {
      const [, prop, value] = m;
      if (/^(-webkit-)?mask(-image)?$/.test(prop) && !/^(none|initial|unset)$/.test(value)) frame.masks.push(bufLine);
      if (/^animation(-name)?$/.test(prop) && !/^none\b/.test(value)) frame.animated = true;
    }
    buf = "";
  };
  for (const ch of text) {
    if (ch === "\n") line++;
    if (ch === "(") paren++;
    if (ch === ")") paren--;
    if (ch === "{" && paren === 0) {
      frame = { prelude: buf.trim(), parent: frame, animated: false, masks: [] };
      frames.push(frame);
      buf = "";
    } else if (ch === "}" && paren === 0) {
      declaration();
      frame = frame.parent ?? root;
    } else if (ch === ";" && paren === 0) {
      declaration();
    } else {
      if (!buf.trim()) bufLine = line;
      buf += ch;
    }
  }
  const problems = [];
  for (const f of frames) {
    if (!f.masks.length) continue;
    let reason = "";
    for (let a = f; a && !reason; a = a.parent) {
      if (a.animated) reason = a === f ? "is animated" : `is inside an animated rule (${a.prelude})`;
      else if (/^@(-webkit-)?keyframes\b/.test(a.prelude)) reason = "is inside @keyframes";
    }
    if (reason) for (const l of f.masks) problems.push(`mask on line ${l} ${reason} (${f.prelude}); Firefox draws a moving mask in software`);
  }
  return problems;
}

/** A classic inline script must run inside a function, so top-level names can't collide between scripts. */
export function scriptProblems(code) {
  const body = code.replace(/^(?:\s|\/\/[^\n]*|\/\*[\s\S]*?\*\/)*/, "").replace(/\s+$/, "");
  const opens = /^;?\(\s*(?:async\s*)?(?:\(\s*\)\s*=>|function\b)|^!\s*function\b|^;?\(\s*(?:async\s*)?\(\s*\)\s*=>/.test(body);
  const closes = /\)\s*\(\s*\)\s*;?$|\}\s*\(\s*\)\s*\)\s*;?$/.test(body);
  return opens && closes ? [] : ["script isn't wrapped in a function that runs itself, e.g. (() => { ... })();"];
}

/** Any absolute http(s) address in code must be on the allowed-hosts list (no third-party services). */
export function hostProblems(text, allowed) {
  const problems = [];
  for (const m of text.matchAll(/(?:https?:)?\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
    const host = m[1].toLowerCase();
    if (!allowed.includes(host)) problems.push(`refers to ${host}, which isn't in shared/facts.json "allowedHosts"`);
  }
  return [...new Set(problems)];
}

const ID_REFERENCES = ["for", "aria-labelledby", "aria-describedby", "aria-controls", "aria-owns"];

export function check({ root, shared }) {
  const problems = [];
  const fail = (label, msg) => problems.push(`${label}: ${msg}`);

  let result;
  try {
    result = sync({ root, shared, write: false });
  } catch (e) {
    return [`sync: ${e.message}`];
  }
  for (const f of result.changed) fail(relative(root, f), "out of date; run `node sync.mjs`");
  const { facts, pages } = result;

  const exists = (p) => existsSync(join(root, p));
  const pageByPath = new Map(pages.map((p) => [p.path, p]));
  const idsByPath = new Map();
  const parsed = new Map();

  for (const page of pages) {
    const html = readFileSync(page.file, "utf8");
    const s = simplify(html);
    parsed.set(page.path, s);
    const ids = new Set();
    for (const t of tags(s.markup)) if (t.attrs.id !== undefined) ids.add(t.attrs.id);
    idsByPath.set(page.path, ids);
  }

  /** Check one URL found on a page. Returns nothing; records problems. */
  const checkUrl = (label, raw, fromPath, what) => {
    let url = raw.trim();
    if (!url || /^(mailto:|tel:|data:|javascript:)/i.test(url)) return;
    if (url.startsWith(facts.site.url)) url = url.slice(facts.site.url.length) || "/";
    else if (/^(https?:)?\/\//i.test(url)) return;
    if (url.startsWith("#")) {
      const id = decodeURIComponent(url.slice(1));
      if (id && id !== "top" && !idsByPath.get(fromPath)?.has(id)) fail(label, `${what} points at #${id}, which doesn't exist on this page`);
      return;
    }
    if (!url.startsWith("/")) return fail(label, `${what} "${raw}" is not root-relative (start it with "/")`);
    const [pathAndQuery, frag] = url.split("#");
    const path = pathAndQuery.split("?")[0];
    const dirIndex = join(path, "index.html");
    if (path.endsWith("/")) {
      if (!exists(dirIndex)) return fail(label, `${what} "${raw}" doesn't match a page`);
    } else if (exists(path) && !exists(dirIndex)) {
      // a plain file (css, image, ...)
    } else if (exists(dirIndex)) {
      return fail(label, `${what} "${raw}" should end in "/" (it is a page)`);
    } else return fail(label, `${what} "${raw}" doesn't exist`);
    if (frag) {
      const target = pageByPath.get(path);
      if (target && !idsByPath.get(target.path)?.has(decodeURIComponent(frag))) fail(label, `${what} "${raw}": no id "${frag}" on that page`);
    }
  };


  for (const page of pages) {
    const label = relative(root, page.file);
    const html = readFileSync(page.file, "utf8");
    const { markup, ld, styles } = parsed.get(page.path);

    if (!/<html[^>]*\slang="en(-us)?"/i.test(markup)) fail(label, `<html> needs lang="en-us"`);
    if (!page.description) fail(label, "missing description");

    let h1 = 0, mains = 0;
    const seenIds = new Set();
    for (const t of tags(markup)) {
      const a = t.attrs;
      if (t.name === "main") {
        mains++;
        if (a.id !== "main-content") fail(label, `<main> needs id="main-content" (the skip link points at it)`);
      }
      const h = t.name.match(/^h([1-6])$/);
      if (h && h[1] === "1") h1++;
      if (a.id !== undefined) {
        if (seenIds.has(a.id)) fail(label, `duplicate id "${a.id}"`);
        seenIds.add(a.id);
      }
      for (const attr of ID_REFERENCES) {
        for (const id of (a[attr] ?? "").split(/\s+/).filter(Boolean)) {
          if (!idsByPath.get(page.path).has(id)) fail(label, `<${t.name} ${attr}="${id}"> points at an id that doesn't exist on this page`);
        }
      }
      if (t.name === "img" && a.alt === undefined) fail(label, `<img src="${a.src}"> has no alt attribute`);
      if (t.name === "a" && a.href !== undefined) checkUrl(label, a.href, page.path, "link");
      if (t.name === "form" && a.action) checkUrl(label, a.action, page.path, "form action");
      if (t.name === "link" && a.href) checkUrl(label, a.href, page.path, `<link ${a.rel}>`);
      if ((t.name === "script" || t.name === "img" || t.name === "source" || t.name === "video" || t.name === "audio") && a.src) checkUrl(label, a.src, page.path, `<${t.name}> src`);
      if (a.srcset) for (const part of a.srcset.split(",")) checkUrl(label, part.trim().split(/\s+/)[0], page.path, "srcset");
      if (t.name === "meta" && /^(og:image|og:url|twitter:image)$/.test(a.property ?? a.name ?? "") && a.content) checkUrl(label, a.content, page.path, `<meta ${a.property ?? a.name}>`);
    }
    if (h1 !== 1) fail(label, `needs exactly one <h1> (found ${h1})`);
    if (mains !== 1) fail(label, `needs exactly one <main> (found ${mains})`);

    for (const m of markup.replace(/<style[\s\S]*?<\/style>/gi, "").matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)) {
      const address = m[0].replace(/\.+$/, "");
      if (!facts.emails.includes(address)) fail(label, `email ${address} is not one of shared/facts.json "emails"`);
    }

    for (const body of styles) for (const problem of [...cssProblems(body), ...maskProblems(body)]) fail(label, `inline <style>: ${problem}`);

    const ranges = fontRanges(styles.join("\n"));
    const covered = (cp) => ranges.some(([a, b]) => cp >= a && cp <= b);
    const text = decode(visibleText(markup), problems, label);
    const bad = new Set();
    for (const ch of text) {
      const cp = ch.codePointAt(0);
      if (cp <= 0x20 || (cp >= 0x7f && cp <= 0x9f) || cp === 0xa0 || cp === 0xad) continue;
      if (!covered(cp) && !(facts.allowedChars ?? []).includes(ch)) bad.add(`${ch} (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`);
    }
    if (bad.size) fail(label, `characters outside the shipped fonts: ${[...bad].join(", ")}`);
  }

  const cssDir = join(shared, "css");
  if (existsSync(cssDir)) {
    for (const name of readdirSync(cssDir).filter((n) => n.endsWith(".css"))) {
      const label = `css/${name}`;
      const raw = readFileSync(join(cssDir, name), "utf8");
      for (const problem of [...cssProblems(raw), ...maskProblems(raw)]) fail(label, problem);
      const css = raw.replace(/\/\*[\s\S]*?\*\//g, "");
      for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)|@import\s+['"]([^'"]+)['"]/g)) {
        const u = m[1] ?? m[2];
        if (u.startsWith("data:") || u.startsWith("#")) continue;
        checkUrl(label, u, "/", "css url");
      }
    }
  }

  // Scripts: files load as modules, classic inline scripts are wrapped, and nothing loads from a third-party host
  const allowedHosts = facts.allowedHosts ?? [];
  const scriptLabel = (label, problems) => problems.forEach((m) => fail(label, m));
  const jsDir = join(root, "js");
  if (existsSync(jsDir)) {
    for (const name of readdirSync(jsDir).filter((n) => n.endsWith(".js"))) {
      const code = readFileSync(join(jsDir, name), "utf8");
      scriptLabel(`js/${name}`, hostProblems(code, allowedHosts));
    }
  }
  for (const page of pages) {
    const label = relative(root, page.file);
    const html = readFileSync(page.file, "utf8").replace(/<!--[\s\S]*?-->/g, "");
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attrs = parseAttrs(m[1]);
      if (attrs.src !== undefined) {
        if (attrs.type?.trim().toLowerCase() !== "module") fail(label, `<script src="${attrs.src}"> isn't type="module", so its top-level names are shared with every other script`);
      } else if ((!attrs.type || /javascript|module/i.test(attrs.type)) && m[2].trim()) {
        const wrap = attrs.type?.trim().toLowerCase() === "module" ? [] : scriptProblems(m[2]);
        scriptLabel(`${label}: inline <script>`, [...wrap, ...hostProblems(m[2], allowedHosts)]);
      }
    }
    for (const t of tags(simplify(html).markup)) {
      const url = t.name === "link" ? t.attrs.href : t.name === "form" ? t.attrs.action : t.name === "a" || t.name === "meta" ? undefined : t.attrs.src;
      if (url && /^(?:https?:)?\/\//i.test(url.trim())) for (const m of hostProblems(url, allowedHosts)) fail(label, `<${t.name}> ${m}`);
    }
  }

  // Size budget: gzipped HTML plus the CSS and JS it links
  const budgets = facts.sizeBudgetKB;
  if (budgets) {
    const gz = (buf) => gzipSync(buf, { level: 9 }).length;
    for (const page of pages) {
      const html = readFileSync(page.file);
      let total = gz(html);
      const refs = new Set([...html.toString("utf8").matchAll(/(?:href|src)="(\/(?:css|js)\/[^"?#]+)/g)].map((m) => m[1]));
      for (const ref of refs) if (exists(ref.slice(1))) total += gz(readFileSync(join(root, ref)));
      const limit = (budgets[page.path] ?? budgets.default) * 1024;
      if (total > limit) fail(relative(root, page.file), `${(total / 1024).toFixed(1)} KB gzipped (HTML + CSS + JS) is over its ${limit / 1024} KB budget in shared/facts.json "sizeBudgetKB"`);
    }
  }

  // robots.txt -> sitemap
  if (existsSync(join(root, "robots.txt"))) {
    for (const m of readFileSync(join(root, "robots.txt"), "utf8").matchAll(/^Sitemap:\s*(\S+)/gim)) checkUrl("robots.txt", m[1], "/", "Sitemap");
  }

  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
  const problems = check({
    root: resolve(here, opt("--root", "site")),
    shared: resolve(here, opt("--shared", "shared")),
  });
  if (problems.length) {
    console.error(problems.map((p) => `✗ ${p}`).join("\n"));
    console.error(`\ncheck: ${problems.length} problem${problems.length === 1 ? "" : "s"}`);
    process.exit(1);
  }
  console.log("check: all good");
}
