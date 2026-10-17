#!/usr/bin/env node
/*
  lighthouse.mjs: updates the Lighthouse panel in the home page footer.

    node lighthouse.mjs

  Runs PageSpeed Insights (mobile) on the live home page and writes the
  numbers between the <!-- lighthouse --> markers in site/index.html.
  Run it after a deploy, then commit and deploy again. A PSI_KEY environment
  variable is used if set; without one, Google's shared quota may refuse.
  If the request fails, the page is left as it is.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = join(here, "site/index.html");
const facts = JSON.parse(readFileSync(join(here, "shared/facts.json"), "utf8"));

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
const metrics = {
  blockingTime: audit("total-blocking-time"),
  speedIndex: audit("speed-index"),
  tti: audit("interactive"),
  performanceScore: Math.round(lh.categories.performance.score * 100),
};

const panel = `    <figure class="pagespeed">
      <figcaption class="small-caps">Lighthouse Metrics</figcaption>
      <ul>
        <li><span>Blocking Time:</span><span>${metrics.blockingTime}</span></li>
        <li><span>Speed Index:</span><span>${metrics.speedIndex}</span></li>
        <li><span>Time to Interactive:</span><span>${metrics.tti}</span></li>
        <li class="performance"><span>Performance Score:</span><span>&nbsp;&nbsp;${metrics.performanceScore}</span></li>
      </ul>
    </figure>`;

const html = readFileSync(PAGE, "utf8");
const re = /(<!-- lighthouse -->)[\s\S]*?(\n\s*<!-- \/lighthouse -->)/;
if (!re.test(html)) throw new Error("site/index.html: missing the <!-- lighthouse --> ... <!-- /lighthouse --> markers");
writeFileSync(PAGE, html.replace(re, (_, open, close) => `${open}\n${panel}${close}`));
console.log("lighthouse:", metrics);
