#!/usr/bin/env node
/*
  projects.mjs: writes the list of GitHub repositories on /code/.

    node projects.mjs
    node projects.mjs --file repos.json
    node projects.mjs --page path/to/index.html

  Fetches the public repositories of samfeldstein from the GitHub API
  (a GITHUB_TOKEN environment variable is used if set), leaves out forks,
  archived and private repositories and the profile README repository, and
  rewrites the list between the <!-- projects --> markers in
  site/code/index.html, newest first. --file reads the repositories from a
  JSON file instead of the network; --page writes to another page.

  If GitHub can't be reached or returns no repositories, it prints a warning
  and exits 0 with the page unchanged, so a build never fails or empties the
  list. Characters outside the site's font subset (emoji, for example) are
  dropped from descriptions so check.mjs's font coverage still passes. Then
  run sync, check and commit.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = join(here, "site/code/index.html");
const API = "https://api.github.com/users/samfeldstein/repos?per_page=100&type=owner&sort=pushed";
const PROFILE = "samfeldstein";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const ACRONYMS = new Set(["rss", "css", "html", "js", "ui", "api", "cli", "csa", "osint"]);
const SMALL = new Set(["a", "an", "and", "the", "of", "for", "to", "in", "on"]);
const MARKERS = /(<!-- projects -->)[\s\S]*?(\n[ \t]*<!-- \/projects -->)/;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function filterRepos(repos) {
  return repos
    .filter((r) => r && !r.fork && !r.archived && !r.private && r.name?.toLowerCase() !== PROFILE)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export function displayName(name) {
  return String(name)
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      if (i > 0 && SMALL.has(lower)) return lower;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function repoLink(repo) {
  const home = (repo.homepage ?? "").trim();
  return /^https?:\/\/\S+$/i.test(home) ? home : repo.html_url;
}

export function formatDate(iso) {
  const d = new Date(iso);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return { datetime: `${d.getUTCFullYear()}-${month}`, text: `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` };
}

const FONT_RANGES = [[0x20, 0x7e], [0xa0, 0xff], [0x131, 0x131], [0x152, 0x153], [0x2013, 0x2014], [0x2018, 0x201a], [0x201c, 0x201e], [0x2020, 0x2022], [0x2026, 0x2026], [0x2032, 0x2033], [0x2039, 0x203a], [0x2122, 0x2122]];

export const inFont = (text) =>
  [...text]
    .filter((ch) => FONT_RANGES.some(([a, b]) => ch.codePointAt(0) >= a && ch.codePointAt(0) <= b))
    .join("")
    .replace(/\s+/g, " ")
    .trim();

export function renderEntry(repo) {
  const date = formatDate(repo.created_at);
  const desc = inFont(repo.description ?? "");
  return `        <li><a class="work" href="${esc(repoLink(repo))}"><span class="work-name">${esc(displayName(repo.name))}</span><span class="work-date"><time datetime="${date.datetime}">${date.text}</time></span></a>${desc ? `<p class="work-desc">${esc(desc)}</p>` : ""}</li>`;
}

export function renderEntries(repos) {
  return repos.map(renderEntry).join("\n");
}

export const hasMarkers = (html) => MARKERS.test(html);

export function replaceBlock(html, entries) {
  if (!hasMarkers(html)) throw new Error("missing the <!-- projects --> ... <!-- /projects --> markers");
  return html.replace(MARKERS, (_, open, close) => `${open}\n${entries}${close}`);
}

function nextLink(header) {
  for (const part of (header ?? "").split(",")) {
    const match = part.match(/<([^>]+)>\s*;\s*rel="next"/);
    if (match) return match[1];
  }
  return null;
}

async function fetchRepos() {
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "samfeldstein.xyz" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const repos = [];
  for (let url = API; url; ) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`GitHub answered ${response.status}${response.headers.get("x-ratelimit-remaining") === "0" ? " (rate limited)" : ""}`);
    const page = await response.json();
    if (!Array.isArray(page)) throw new Error("GitHub returned something other than a list");
    repos.push(...page);
    url = nextLink(response.headers.get("link"));
  }
  return repos;
}

function readRepos(file) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  if (!Array.isArray(data)) throw new Error(`${file} is not a JSON array`);
  return data;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const option = (flag) => {
    const i = args.indexOf(flag);
    if (i === -1) return null;
    if (!args[i + 1]) {
      console.error(`projects: ${flag} needs a path`);
      process.exit(1);
    }
    return args[i + 1];
  };
  const file = option("--file");
  const page = option("--page") ?? PAGE;

  const html = readFileSync(page, "utf8");
  if (!hasMarkers(html)) {
    console.error(`projects: ${page} is missing the <!-- projects --> ... <!-- /projects --> markers`);
    process.exit(1);
  }

  let repos;
  try {
    repos = filterRepos(file ? readRepos(file) : await fetchRepos());
  } catch (err) {
    console.error(`projects: warning: couldn't get the repositories (${err.message}); the page is unchanged`);
    process.exit(0);
  }
  if (!repos.length) {
    console.error("projects: warning: no repositories left after filtering; the page is unchanged");
    process.exit(0);
  }

  writeFileSync(page, replaceBlock(html, renderEntries(repos)));
  console.log(`projects: ${repos.length} repositories`);
}
