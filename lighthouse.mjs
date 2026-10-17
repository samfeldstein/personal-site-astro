#!/usr/bin/env node
/*
  lighthouse.mjs: updates the Lighthouse panel in every page's colophon.

    node lighthouse.mjs 100 "0 ms" "2.7 s" "1.5 s"
    node lighthouse.mjs

  With numbers (performance score, total blocking time, speed index,
  largest contentful paint), writes them as given, e.g. from a Lighthouse run in Chrome
  DevTools (mobile). Without them, runs PageSpeed Insights (mobile) on the
  live home page; a PSI_KEY environment variable is used if set. Either way
  it writes shared/lighthouse.html; then run sync, commit and deploy. If the
  request fails, nothing changes.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = join(here, "shared/lighthouse.html");
const facts = JSON.parse(readFileSync(join(here, "shared/facts.json"), "utf8"));

async function fromPageSpeed() {
  const url = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  url.searchParams.set("url", `${facts.site.url}/`);
  if (process.env.PSI_KEY) url.searchParams.set("key", process.env.PSI_KEY);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`lighthouse: PageSpeed Insights answered ${response.status}; the page is unchanged`);
    process.exit(1);
  }
  const { lighthouseResult: lh } = await response.json();
  const audit = (id) => lh.audits[id]?.displayValue;
  return {
    performanceScore: Math.round(lh.categories.performance.score * 100),
    blockingTime: audit("total-blocking-time"),
    speedIndex: audit("speed-index"),
    lcp: audit("largest-contentful-paint"),
  };
}

const args = process.argv.slice(2);
if (args.length && args.length !== 4) {
  console.error('lighthouse: give all four numbers, e.g. node lighthouse.mjs 100 "0 ms" "2.7 s" "1.5 s"');
  process.exit(1);
}
const metrics = args.length
  ? { performanceScore: args[0], blockingTime: args[1], speedIndex: args[2], lcp: args[3] }
  : await fromPageSpeed();

const panel = `<figure class="pagespeed">
  <figcaption>Lighthouse scores</figcaption>
  <dl>
    <div><dt>Performance</dt><dd>${metrics.performanceScore}</dd></div>
    <div><dt>Blocking time</dt><dd>${metrics.blockingTime}</dd></div>
    <div><dt>Speed index</dt><dd>${metrics.speedIndex}</dd></div>
    <div><dt>Largest paint</dt><dd>${metrics.lcp}</dd></div>
  </dl>
</figure>
`;

writeFileSync(PAGE, panel);
console.log("lighthouse:", metrics);
