import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { displayName, filterRepos, inFont, formatDate, renderEntries, renderEntry, replaceBlock, repoLink } from "../projects.mjs";

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
  assert.deepEqual(formatDate("2024-03-15T12:00:00Z"), { datetime: "2024-03", text: "March 2024" });
  assert.deepEqual(formatDate("2023-12-31T23:30:00Z"), { datetime: "2023-12", text: "December 2023" });
  assert.deepEqual(formatDate("2025-01-01T00:00:00Z"), { datetime: "2025-01", text: "January 2025" });
});

test("renderEntry writes the exact markup", () => {
  assert.equal(
    renderEntry(repo({ name: "rss-feeds", description: "Feeds." })),
    '        <li><a class="work" href="https://github.com/samfeldstein/thing"><span class="work-name">RSS Feeds</span><span class="work-date"><time datetime="2024-03">March 2024</time></span></a><p class="work-desc">Feeds.</p></li>',
  );
});

test("renderEntry leaves out the description paragraph when there is none", () => {
  for (const description of ["", null, undefined, "   "]) {
    const out = renderEntry(repo({ description }));
    assert.doesNotMatch(out, /work-desc/);
    assert.match(out, /<\/a><\/li>$/);
  }
});

test("renderEntry escapes data", () => {
  const out = renderEntry(repo({ description: `<b>Tom & Jerry's "show"</b> $& $1`, homepage: 'https://example.com/?a=1&b="2"' }));
  assert.match(out, /<p class="work-desc">&lt;b&gt;Tom &amp; Jerry&#39;s &quot;show&quot;&lt;\/b&gt; \$&amp; \$1<\/p>/);
  assert.match(out, /href="https:\/\/example\.com\/\?a=1&amp;b=&quot;2&quot;"/);
});

test("replaceBlock replaces only the inside of the markers, even with $ in the data", () => {
  const html = "<ul>\n      <!-- projects -->\n        <li>old</li>\n      <!-- /projects -->\n</ul>\n<p>after</p>\n";
  const entries = renderEntries([repo({ description: "Costs $& and $1 and $$." })]);
  const out = replaceBlock(html, entries);
  assert.equal(out, `<ul>\n      <!-- projects -->\n${entries}\n      <!-- /projects -->\n</ul>\n<p>after</p>\n`);
  assert.match(out, /Costs \$&amp; and \$1 and \$\$\./);
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
    const out = execFileSync("node", [script, "--file", join(dir, "repos.json"), "--page", join(dir, "index.html")], { encoding: "utf8" });
    assert.equal(out.trim(), "projects: 2 repositories");
    const html = readFileSync(join(dir, "index.html"), "utf8");
    assert.equal(
      html,
      "<!doctype html>\n<ol>\n      <!-- projects -->\n" +
        '        <li><a class="work" href="https://rss.example/"><span class="work-name">RSS Feeds</span><span class="work-date"><time datetime="2024-08">August 2024</time></span></a><p class="work-desc">A thing.</p></li>\n' +
        '        <li><a class="work" href="https://github.com/samfeldstein/thing"><span class="work-name">First Website</span><span class="work-date"><time datetime="2019-05">May 2019</time></span></a></li>\n' +
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
