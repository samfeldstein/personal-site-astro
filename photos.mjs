#!/usr/bin/env node
/*
  photos.mjs: builds the gallery on /photos/ from the JPGs in photos/.

  Run it after adding, removing or re-captioning a photo:

    npm install          (once; installs sharp and exiftool-vendored)
    node photos.mjs

  For each photo it reads the title, description (the alt text) and creation
  date with ExifTool, writes WebP copies at the widths below into
  site/img/photos/ (only the ones that don't exist yet), deletes copies of
  photos that are gone, and rewrites the gallery between the
  <!-- gallery --> markers in site/photos/index.html, newest first, as
  numbered plates.

  A changed photo that keeps its file name keeps its old WebPs; delete
  site/img/photos/<name>-*.webp first to regenerate them.
*/
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from "node:fs";
import { join, parse, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ExifTool } from "exiftool-vendored";

const here = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(here, "photos");
const OUT = join(here, "site/img/photos");
const PAGE = join(here, "site/photos/index.html");
const WIDTHS = [256, 691, 936, 1382, 1640, 1850, 2048];
const SIZES = "(min-width: 1100px) 200px, (min-width: 640px) 25vw, 45vw";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const exiftool = new ExifTool();
const photos = [];
try {
  for (const file of readdirSync(SOURCE).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
    const path = join(SOURCE, file);
    const name = parse(file).name;
    let tags = {};
    try {
      tags = await exiftool.read(path);
    } catch (err) {
      console.error(`Error reading metadata for ${file}:`, err);
    }
    const meta = await sharp(path).metadata();
    const [width, height] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
    const widths = WIDTHS.filter((w) => w <= width);
    if (widths.length < WIDTHS.length && !widths.includes(width)) widths.push(width);
    mkdirSync(OUT, { recursive: true });
    for (const w of widths) {
      const out = join(OUT, `${name}-${w}.webp`);
      if (existsSync(out)) continue;
      await sharp(path).rotate().resize({ width: w }).webp().toFile(out);
      console.log(`wrote img/photos/${name}-${w}.webp`);
    }
    photos.push({
      name,
      widths,
      width,
      height,
      title: tags.Title || "Untitled",
      shown: (tags.Title || "").replace(/\s+\d+$/, ""),
      month: tags.CreateDate?.year ? `${MONTHS[tags.CreateDate.month - 1]} ${tags.CreateDate.year}` : "",
      date: tags.CreateDate || "Unknown date",
      alt: tags.Description || "",
    });
  }
} finally {
  await exiftool.end();
}

if (!photos.length) {
  console.error("photos: no photos found in photos/; nothing changed");
  process.exit(1);
}

photos.sort((a, b) => {
  if (a.date === "Unknown date" && b.date === "Unknown date") return 0;
  if (a.date === "Unknown date") return 1;
  if (b.date === "Unknown date") return -1;
  return new Date(b.date) - new Date(a.date);
});

const keep = new Set(photos.flatMap((p) => p.widths.map((w) => `${p.name}-${w}.webp`)));
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".webp") && !keep.has(f)) {
    unlinkSync(join(OUT, f));
    console.log(`deleted img/photos/${f}`);
  }
}

const img = (p, i) => {
  const url = (w) => `/img/photos/${p.name}-${w}.webp`;
  const priority = i === 0 ? ' loading="eager" decoding="async" fetchpriority="high"' : ' loading="lazy" decoding="async"';
  const info = `<span class="thumb-info" aria-hidden="true"><span class="thumb-title">${esc(p.shown)}</span>${p.month ? `<span class="thumb-date">${p.month}</span>` : ""}</span>`;
  return `      <li><a class="thumb" href="${url(p.widths.at(-1))}" data-title="${esc(p.shown)}" data-date="${p.month}"><img src="${url(p.widths[1] ?? p.widths[0])}" srcset="${p.widths.map((w) => `${url(w)} ${w}w`).join(", ")}" sizes="${SIZES}" alt="${esc(p.alt || p.title)}"${priority} width="${p.width}" height="${p.height}">${info}</a></li>`;
};

const html = readFileSync(PAGE, "utf8");
const re = /(<!-- gallery -->)[\s\S]*?(\n\s*<!-- \/gallery -->)/;
if (!re.test(html)) throw new Error("site/photos/index.html: missing the <!-- gallery --> ... <!-- /gallery --> markers");
writeFileSync(PAGE, html.replace(re, (_, open, close) => `${open}\n${photos.map(img).join("\n")}${close}`));
console.log(`photos: ${photos.length} photos in the gallery`);
