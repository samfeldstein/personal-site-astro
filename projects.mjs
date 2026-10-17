#!/usr/bin/env node
/*
  projects.mjs: writes the list of GitHub repositories on /code/.

    node projects.mjs             update the list, report repositories waiting for approval
    node projects.mjs --approve   also approve the waiting ones under their suggested names
    --file repos.json             read the repositories from a file instead of GitHub
    --page path/to/index.html     write to another page
    --names path/to/names.json    use another approved-names file

  Fetches the public repositories of samfeldstein from the GitHub API
  (a GITHUB_TOKEN environment variable is used if set) and leaves out forks,
  archived and private repositories and the profile README repository.
  Only repositories listed in projects.json are shown, under the name given
  there; that is the owner's approval of each name. New repositories stay
  off the page and are reported with a suggested name until approved, either
  with --approve or by adding them to projects.json by hand. The list goes
  between the <!-- projects --> markers in site/code/index.html, newest first.
  A repository's date is its GitHub creation month unless projects.json gives
  another under "started" (YYYY-MM), for projects older than their repository.

  It also checks the languages GitHub counts in each listed repository: any
  that makes up at least a fifth of one and is missing from the skills line on
  the Code page is added to the line (before Claude, if it's last), unless
  projects.json lists it under "notSkills". In a terminal it asks first; in a
  build it adds it and says so. Move it where it belongs by hand.

  If GitHub can't be reached or no approved repositories remain, it prints a
  warning and exits 0 with the page unchanged, so a build never fails or
  empties the list. Characters outside the site's font subset (emoji, for
  example) are dropped from descriptions so check.mjs's font coverage still
  passes. Then run sync, check and commit.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const PAGE = join(here, "site/code/index.html");
const NAMES_FILE = join(here, "projects.json");
const API = "https://api.github.com/users/samfeldstein/repos?per_page=100&type=owner&sort=pushed";
const PROFILE = "samfeldstein";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ACRONYMS = new Set(["rss", "css", "html", "js", "ui", "api", "cli", "csa", "osint"]);
const SMALL = new Set(["a", "an", "and", "the", "of", "for", "to", "in", "on"]);
const MAIN_LANGUAGE = 0.2;
const LANGUAGE_SKILL = { Shell: "Bash", SCSS: "Sass" };
const MARKERS = /(<!-- projects -->)[\s\S]*?(\n[ \t]*<!-- \/projects -->)/;

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function filterRepos(repos) {
  return repos
    .filter((r) => r && !r.fork && !r.archived && !r.private && r.name?.toLowerCase() !== PROFILE)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

export function applyStarted(repos, started = {}) {
  return repos.map((repo) =>
    /^\d{4}-\d{2}$/.test(started[repo?.name] ?? "") ? { ...repo, created_at: `${started[repo.name]}-01T00:00:00Z` } : repo,
  );
}

export function skillsIn(html) {
  const match = html.match(/<section class="skills"[\s\S]*?<p>([^<]*)<\/p>/);
  return match ? match[1].split(",").map((skill) => skill.trim()).filter(Boolean) : [];
}

export function missingSkills(languages, skills, skip = []) {
  const known = new Set([...skills, ...skip].map((s) => s.toLowerCase()));
  const missing = new Map();
  for (const [repo, counts] of Object.entries(languages)) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    for (const [language, bytes] of Object.entries(counts)) {
      const skill = LANGUAGE_SKILL[language] ?? language;
      if (bytes / total < MAIN_LANGUAGE || known.has(skill.toLowerCase()) || known.has(language.toLowerCase())) continue;
      missing.set(skill, [...(missing.get(skill) ?? []), repo]);
    }
  }
  return [...missing].map(([skill, repos]) => ({ skill, repos }));
}

export function addSkills(html, add) {
  const skills = skillsIn(html);
  if (!add.length || !skills.length) return html;
  const last = skills.at(-1) === "Claude" ? [skills.pop()] : [];
  return html.replace(/(<section class="skills"[\s\S]*?<p>)[^<]*(<\/p>)/, (_, open, close) => `${open}${[...skills, ...add, ...last].join(", ")}${close}`);
}

async function confirm(question) {
  if (!process.stdin.isTTY) return true;
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [Y/n] `);
  rl.close();
  return !/^n/i.test(answer.trim());
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

export function renderEntry(repo, name = displayName(repo.name)) {
  const date = formatDate(repo.created_at);
  const desc = inFont(repo.description ?? "").replace(/'/g, "\u2019").replace(/[.\s]+$/, "");
  const type = /^https?:\/\//i.test(repo.homepage ?? "") ? "Website" : "Source code";
  return `        <li><a href="${esc(repoLink(repo))}"><span class="work-line"><cite class="work-title">${esc(name)}</cite><time datetime="${date.datetime}">${date.text}</time></span><span class="work-source">${desc ? `<i>${esc(desc)}</i>` : `<span class="work-type">${type}</span>`}</span></a></li>`;
}

export function renderEntries(repos, names = {}) {
  return repos.map((repo) => renderEntry(repo, names[repo.name] ?? displayName(repo.name))).join("\n");
}

export function splitApproved(repos, names) {
  return {
    shown: repos.filter((repo) => Object.hasOwn(names, repo.name)),
    waiting: repos.filter((repo) => !Object.hasOwn(names, repo.name)),
  };
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

const headers = { Accept: "application/vnd.github+json", "User-Agent": "samfeldstein.xyz" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`GitHub answered ${response.status}${response.headers.get("x-ratelimit-remaining") === "0" ? " (rate limited)" : ""}`);
  return response;
}

async function fetchLanguages(repos) {
  const languages = {};
  for (const repo of repos) languages[repo.name] = await (await get(repo.languages_url)).json();
  return languages;
}

async function fetchRepos() {
  const repos = [];
  for (let url = API; url; ) {
    const response = await get(url);
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
  const namesFile = option("--names") ?? NAMES_FILE;
  let config, names;
  try {
    config = JSON.parse(readFileSync(namesFile, "utf8"));
    names = config.names;
    if (!names || typeof names !== "object") throw new Error('it needs a "names" object');
  } catch (err) {
    console.error(`projects: can't read the approved names in ${namesFile} (${err.message})`);
    process.exit(1);
  }

  const html = readFileSync(page, "utf8");
  if (!hasMarkers(html)) {
    console.error(`projects: ${page} is missing the <!-- projects --> ... <!-- /projects --> markers`);
    process.exit(1);
  }

  let repos;
  try {
    repos = filterRepos(applyStarted(file ? readRepos(file) : await fetchRepos(), config.started));
  } catch (err) {
    console.error(`projects: warning: couldn't get the repositories (${err.message}); the page is unchanged`);
    process.exit(0);
  }
  let { shown, waiting } = splitApproved(repos, names);
  if (waiting.length && args.includes("--approve")) {
    for (const repo of waiting) names[repo.name] = displayName(repo.name);
    writeFileSync(namesFile, JSON.stringify({ ...config, names }, null, 2) + "\n");
    console.log(`projects: approved ${waiting.map((r) => `${r.name} as "${names[r.name]}"`).join(", ")}`);
    ({ shown, waiting } = splitApproved(repos, names));
  }
  if (waiting.length) {
    console.log("projects: waiting for your approval (not on the site yet):");
    for (const repo of waiting) console.log(`  ${repo.name} → "${displayName(repo.name)}"`);
    console.log("  Approve these names with `node projects.mjs --approve`, or add them to projects.json with the names you want.");
  }
  if (!shown.length) {
    console.error("projects: warning: no approved repositories; the page is unchanged");
    process.exit(0);
  }

  let out = replaceBlock(html, renderEntries(shown, names));
  console.log(`projects: ${shown.length} repositories on the page`);

  if (!file) {
    try {
      const add = [];
      for (const { skill, repos } of missingSkills(await fetchLanguages(shown), skillsIn(html), config.notSkills)) {
        const where = `${skill} is a main language of ${repos.join(", ")} but not in the Code page skills`;
        if (await confirm(`projects: ${where}. Add it?`)) {
          add.push(skill);
          console.log(`projects: added ${skill} to the skills line; move it where it belongs, or list it under "notSkills" in projects.json`);
        } else {
          console.log(`projects: left ${skill} out; list it under "notSkills" in projects.json to stop this question`);
        }
      }
      out = addSkills(out, add);
    } catch (err) {
      console.error(`projects: warning: couldn't check the languages (${err.message})`);
    }
  }
  writeFileSync(page, out);
}
