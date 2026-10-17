import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { displayName, filterRepos, inFont, splitApproved, formatDate, renderEntries, renderEntry, replaceBlock, repoLink } from "../projects.mjs";

const script = fileURLToPath(new URL("../projects.mjs", import.meta.url));

const repo = (over) => ({
  name: "thing",
  fork: false,
  archived: false,
  private: false,
  html_url: "https://github.com/samfeldstein/thing",
  homepage: null,
  description: "A thing.",
  created_at: "2024-03-15T12:00:00Z",
  ...over,
});

test("filterRepos drops forks, archived, private and the profile repo", () => {
  const kept = filterRepos([
    repo({ name: "keep" }),
    repo({ name: "forked", fork: true }),
    repo({ name: "old", archived: true }),
    repo({ name: "secret", private: true }),
    repo({ name: "samfeldstein" }),
  ]);
  assert.deepEqual(kept.map((r) => r.name), ["keep"]);
});

test("filterRepos sorts newest first by created_at", () => {
  const kept = filterRepos([
    repo({ name: "middle", created_at: "2023-06-01T00:00:00Z" }),
    repo({ name: "newest", created_at: "2025-01-01T00:00:00Z" }),
    repo({ name: "oldest", created_at: "2020-01-01T00:00:00Z" }),
  ]);
  assert.deepEqual(kept.map((r) => r.name), ["newest", "middle", "oldest"]);
});

test("displayName capitalizes words, upper-cases acronyms and keeps short words lower", () => {
  assert.equal(displayName("rss-feeds"), "RSS Feeds");
  assert.equal(displayName("first-website"), "First Website");
  assert.equal(displayName("shelf-talkers"), "Shelf Talkers");
  assert.equal(displayName("notebook-astro"), "Notebook Astro");
  assert.equal(displayName("presswork-web-co"), "Presswork Web Co");
  assert.equal(displayName("the-art_of-css"), "The Art of CSS");
  assert.equal(displayName("osint-cli-for-the-api"), "OSINT CLI for the API");
});

test("repoLink prefers an http(s) homepage and falls back to html_url", () => {
  assert.equal(repoLink(repo({ homepage: "https://example.com/" })), "https://example.com/");
  assert.equal(repoLink(repo({ homepage: "http://example.com" })), "http://example.com");
  assert.equal(repoLink(repo({ homepage: "" })), "https://github.com/samfeldstein/thing");
  assert.equal(repoLink(repo({ homepage: null })), "https://github.com/samfeldstein/thing");
  assert.equal(repoLink(repo({ homepage: "example.com" })), "https://github.com/samfeldstein/thing");
  assert.equal(repoLink(repo({ homepage: "javascript:alert(1)" })), "https://github.com/samfeldstein/thing");
});

test("formatDate gives the UTC month and year", () => {
  assert.deepEqual(formatDate("2024-03-15T12:00:00Z"), { datetime: "2024-03", text: "Mar 2024" });
  assert.deepEqual(formatDate("2023-12-31T23:30:00Z"), { datetime: "2023-12", text: "Dec 2023" });
  assert.deepEqual(formatDate("2025-01-01T00:00:00Z"), { datetime: "2025-01", text: "Jan 2025" });
});

test("renderEntry writes the exact markup", () => {
  assert.equal(
    renderEntry(repo({ name: "rss-feeds", description: "Feeds." })),
    '        <li><a href="https://github.com/samfeldstein/thing"><span class="work-line"><cite class="work-title">RSS Feeds</cite><time datetime="2024-03">Mar 2024</time></span><span class="work-source"><i>Feeds</i></span></a></li>',
  );
});

test("renderEntry leaves out the description when there is none", () => {
  for (const description of ["", null, undefined, "   "]) {
    const out = renderEntry(repo({ description }));
    assert.doesNotMatch(out, /<i>/);
    assert.match(out, /<span class="work-source"><span class="work-type">Source code<\/span><\/span><\/a><\/li>$/);
  }
});

test("renderEntry calls a project with a homepage a website", () => {
  assert.match(renderEntry(repo({ homepage: "https://example.com/", description: "" })), /<span class="work-type">Website<\/span>/);
  assert.doesNotMatch(renderEntry(repo({ homepage: "https://example.com/" })), /work-type/);
});

test("renderEntry escapes data", () => {
  const out = renderEntry(repo({ description: `<b>Tom & Jerry's "show"</b> $& $1`, homepage: 'https://example.com/?a=1&b="2"' }));
  assert.match(out, /<i>&lt;b&gt;Tom &amp; Jerry’s &quot;show&quot;&lt;\/b&gt; \$&amp; \$1<\/i>/);
  assert.match(out, /href="https:\/\/example\.com\/\?a=1&amp;b=&quot;2&quot;"/);
});

test("replaceBlock replaces only the inside of the markers, even with $ in the data", () => {
  const html = "<ul>\n      <!-- projects -->\n        <li>old</li>\n      <!-- /projects -->\n</ul>\n<p>after</p>\n";
  const entries = renderEntries([repo({ description: "Costs $& and $1 and $$." })]);
  const out = replaceBlock(html, entries);
  assert.equal(out, `<ul>\n      <!-- projects -->\n${entries}\n      <!-- /projects -->\n</ul>\n<p>after</p>\n`);
  assert.match(out, /Costs \$&amp; and \$1 and \$\$</);
  assert.doesNotMatch(out, /old/);
});

test("replaceBlock throws when the markers are missing", () => {
  assert.throws(() => replaceBlock("<ul></ul>", ""), /markers/);
});

function tempDir() {
  return mkdtempSync(join(tmpdir(), "projects-"));
}

const page = "<!doctype html>\n<ol>\n      <!-- projects -->\n      <!-- /projects -->\n</ol>\n";

test("--file run writes the list into the page", () => {
  const dir = tempDir();
  try {
    writeFileSync(join(dir, "index.html"), page);
    writeFileSync(
      join(dir, "repos.json"),
      JSON.stringify([
        repo({ name: "first-website", created_at: "2019-05-02T00:00:00Z", description: "" }),
        repo({ name: "rss-feeds", created_at: "2024-08-10T00:00:00Z", homepage: "https://rss.example/" }),
        repo({ name: "samfeldstein" }),
        repo({ name: "fork", fork: true }),
      ]),
    );
    writeFileSync(join(dir, "names.json"), JSON.stringify({ names: { "first-website": "First Website", "rss-feeds": "RSS Feeds" } }));
    const out = execFileSync("node", [script, "--file", join(dir, "repos.json"), "--page", join(dir, "index.html"), "--names", join(dir, "names.json")], { encoding: "utf8" });
    assert.equal(out.trim(), "projects: 2 repositories on the page");
    const html = readFileSync(join(dir, "index.html"), "utf8");
    assert.equal(
      html,
      "<!doctype html>\n<ol>\n      <!-- projects -->\n" +
        '        <li><a href="https://rss.example/"><span class="work-line"><cite class="work-title">RSS Feeds</cite><time datetime="2024-08">Aug 2024</time></span><span class="work-source"><i>A thing</i></span></a></li>\n' +
        '        <li><a href="https://github.com/samfeldstein/thing"><span class="work-line"><cite class="work-title">First Website</cite><time datetime="2019-05">May 2019</time></span><span class="work-source"><span class="work-type">Source code</span></span></a></li>\n' +
        "      <!-- /projects -->\n</ol>\n",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("--file run with bad JSON or no repositories warns, exits 0 and leaves the page alone", () => {
  const dir = tempDir();
  try {
    writeFileSync(join(dir, "index.html"), page);
    writeFileSync(join(dir, "bad.json"), "{not json");
    writeFileSync(join(dir, "none.json"), JSON.stringify([repo({ fork: true })]));
    for (const file of ["bad.json", "none.json"]) {
      const out = execFileSync("node", [script, "--file", join(dir, file), "--page", join(dir, "index.html")], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      assert.equal(out, "");
      assert.equal(readFileSync(join(dir, "index.html"), "utf8"), page);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a page without markers exits 1", () => {
  const dir = tempDir();
  try {
    writeFileSync(join(dir, "index.html"), "<ol></ol>\n");
    writeFileSync(join(dir, "repos.json"), JSON.stringify([repo({})]));
    assert.throws(
      () => execFileSync("node", [script, "--file", join(dir, "repos.json"), "--page", join(dir, "index.html")], { stdio: "pipe" }),
      (err) => err.status === 1 && /markers/.test(err.stderr.toString()),
    );
    assert.equal(readFileSync(join(dir, "index.html"), "utf8"), "<ol></ol>\n");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("descriptions drop characters outside the font subset", () => {
  assert.equal(inFont("Fast 🚀 site — “quoted” → done"), "Fast site — “quoted” done");
});

test("only approved repositories are shown, under their approved names", () => {
  const repos = [repo({ name: "notebook-astro" }), repo({ name: "new-thing" })];
  const { shown, waiting } = splitApproved(repos, { "notebook-astro": "Digital Notebook" });
  assert.deepEqual(shown.map((r) => r.name), ["notebook-astro"]);
  assert.deepEqual(waiting.map((r) => r.name), ["new-thing"]);
  assert.match(renderEntries(shown, { "notebook-astro": "Digital Notebook" }), /<cite class="work-title">Digital Notebook<\/cite>/);
});

test("an unapproved repository stays off the page and is reported; --approve adds it", () => {
  const dir = tempDir();
  try {
    writeFileSync(join(dir, "index.html"), page);
    writeFileSync(join(dir, "names.json"), JSON.stringify({ names: { "rss-feeds": "RSS Feeds" } }));
    writeFileSync(join(dir, "repos.json"), JSON.stringify([repo({ name: "rss-feeds" }), repo({ name: "new-thing", created_at: "2025-01-01T00:00:00Z" })]));
    const run = (...extra) => execFileSync("node", [script, "--file", join(dir, "repos.json"), "--page", join(dir, "index.html"), "--names", join(dir, "names.json"), ...extra], { encoding: "utf8" });
    const first = run();
    assert.match(first, /waiting for your approval/);
    assert.match(first, /new-thing → "New Thing"/);
    assert.doesNotMatch(readFileSync(join(dir, "index.html"), "utf8"), /New Thing/);
    const second = run("--approve");
    assert.match(second, /approved new-thing as "New Thing"/);
    assert.match(readFileSync(join(dir, "index.html"), "utf8"), /New Thing/);
    assert.deepEqual(JSON.parse(readFileSync(join(dir, "names.json"), "utf8")).names, { "rss-feeds": "RSS Feeds", "new-thing": "New Thing" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
