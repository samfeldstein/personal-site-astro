#!/usr/bin/env node
/*
  photos.mjs: builds the gallery on /photos/ from the JPGs in photos/.

  Run it after adding, removing or re-captioning a photo:

    npm install          (once; installs sharp and exiftool-vendored)
    node photos.mjs

  For each photo it reads the title, description (the alt text), creation
  date and location (City, State, Country; shown when present) with ExifTool, writes WebP copies at the widths below into
  site/img/photos/ (only the ones that don't exist yet), deletes copies of
  photos that are gone, and rewrites the gallery between the
  <!-- gallery --> markers in site/photos/index.html, newest first, as
  numbered plates.

  It lists the photos with no location at the end of each run.

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
const WIDTHS = [256, 480, 691, 936, 1150, 1382, 1640, 1850, 2048];
const ROW = { small: 160, wide: 320, vw: 22, from: 728, to: 1455, stretch: 1.3 };
const sizes = (ratio) => {
  const r = ratio * ROW.stretch;
  const phone = r * ROW.small;
  return `(min-width: ${ROW.to}px) ${Math.round(r * ROW.wide)}px, (min-width: ${ROW.from}px) ${(r * ROW.vw).toFixed(1)}vw, ${phone > 340 ? "100vw" : `${Math.round(phone)}px`}`;
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const place = (tags) => {
  const city = tags.City;
  const state = tags.State || tags["Province-State"];
  const country = tags.Country || tags["Country-PrimaryLocationName"];
  return [city, state || (city ? country : ""), state || city ? "" : country].filter(Boolean).join(", ").replace(/'/g, "\u2019");
};

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
      shown: (tags.Title || "").replace(/\s+\d+$/, "").replace(/'/g, "\u2019"),
      month: tags.CreateDate?.year ? `${MONTHS[tags.CreateDate.month - 1]} ${tags.CreateDate.year}` : "",
      date: tags.CreateDate || "Unknown date",
      alt: tags.Description || "",
      place: place(tags),
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
  const info = `<span class="thumb-info"><span class="thumb-title">${esc(p.shown)}</span>${p.place ? `<span class="thumb-place">${esc(p.place)}</span>` : ""}${p.month ? `<span class="thumb-date">${p.month}</span>` : ""}</span>`;
  const ratio = +(p.width / p.height).toFixed(3);
  return `      <li style="--r: ${ratio}"><a class="thumb" href="${url(p.widths.at(-1))}" data-title="${esc(p.shown)}"${p.place ? ` data-place="${esc(p.place)}"` : ""} data-date="${p.month}"><img src="${url(p.widths[1] ?? p.widths[0])}" srcset="${p.widths.map((w) => `${url(w)} ${w}w`).join(", ")}" sizes="${sizes(ratio)}" alt="${esc(p.alt || p.title)}"${priority} width="${p.width}" height="${p.height}">${info}</a></li>`;
};

const html = readFileSync(PAGE, "utf8");
const re = /(<!-- gallery -->)[\s\S]*?(\n\s*<!-- \/gallery -->)/;
if (!re.test(html)) throw new Error("site/photos/index.html: missing the <!-- gallery --> ... <!-- /gallery --> markers");
writeFileSync(PAGE, html.replace(re, (_, open, close) => `${open}\n${photos.map(img).join("\n")}${close}`));
console.log(`photos: ${photos.length} photos in the gallery`);
const unplaced = photos.filter((p) => !p.place);
if (unplaced.length) console.log(`photos: no location (City, State, Country) on ${unplaced.length}: ${unplaced.map((p) => p.name).join(", ")}`);
