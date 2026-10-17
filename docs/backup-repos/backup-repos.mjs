#!/usr/bin/env node
// Backs up every GitHub repository you own to this Mac.
//   node backup-repos.mjs            run once now
//   node backup-repos.mjs --install  run at login and daily at noon (copies itself to ~/Library/Application Support/backup-repos)
//   node backup-repos.mjs --uninstall
// Needs the GitHub CLI, signed in (`gh auth login`).
// Existing clones (real folders, not symlinks, with a github.com remote) under your home folder (up to five levels deep; Desktop, Documents, Downloads and
// Library and a few other system folders are skipped so macOS doesn't ask for folder access) are fetched, and fast-forwarded when
// they're on the repo's default branch with no uncommitted changes. Repositories with no clone yet are
// cloned into ~/GitHub. If GitHub can't be reached it tries twice, waits 15 minutes, tries twice more,
// then waits for the next run. Anything it can't pull safely is reported in a notification (only when the
// set of problems changes) and in the log, and left alone.
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOME = homedir();
const CLONE_INTO = join(HOME, "GitHub");
const LABEL = "dev.backup-repos";
const SUPPORT = join(HOME, "Library/Application Support/backup-repos");
const PLIST = join(HOME, "Library/LaunchAgents", `${LABEL}.plist`);
const LOG = join(HOME, "Library/Logs", `${LABEL}.log`);
const STATE = join(SUPPORT, "last-problems.txt");
const FAILS = join(SUPPORT, "failed-runs.txt");
const SKIP = new Set(["Library", "node_modules", "Applications", "Desktop", "Documents", "Downloads", "Pictures", "Music", "Movies", "Public"]);
const DEPTH = 5;
const PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin";

const env = { ...process.env, PATH: `${process.env.PATH ?? ""}:${PATH}`, GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "", SSH_ASKPASS: "", GIT_OPTIONAL_LOCKS: "0" };
const run = (cmd, args, timeout = 120000) => execFileSync(cmd, args, { encoding: "utf8", timeout, stdio: ["ignore", "pipe", "pipe"], env }).trim();
const git = (dir, ...args) => run("git", ["-C", dir, ...args]);
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const log = (message) => console.log(`${new Date().toISOString()} ${message}`);
const notify = (message) => {
  try {
    run("osascript", ["-e", `display notification ${JSON.stringify(Array.from(message).slice(0, 200).join(""))} with title "GitHub backup"`]);
  } catch {}
};

if (process.argv.includes("--install") || process.argv.includes("--uninstall")) {
  const domain = `gui/${process.getuid()}`;
  try {
    run("launchctl", ["bootout", `${domain}/${LABEL}`]);
    sleep(1000);
  } catch {}
  if (process.argv.includes("--uninstall")) {
    if (existsSync(PLIST)) unlinkSync(PLIST);
    console.log(`backup-repos: removed (the log in ${LOG} and the copy in ${SUPPORT} are left)`);
    process.exit(0);
  }
  mkdirSync(SUPPORT, { recursive: true });
  const script = join(SUPPORT, "backup-repos.mjs");
  const self = fileURLToPath(import.meta.url);
  if (!existsSync(script) || realpathSync(self) !== realpathSync(script)) copyFileSync(self, script);
  const launcher = join(SUPPORT, "run.sh");
  writeFileSync(
    launcher,
    `#!/bin/sh
for node in /opt/homebrew/bin/node /usr/local/bin/node "$HOME"/.volta/bin/node "$HOME"/.nvm/versions/node/*/bin/node "$HOME"/.local/share/fnm/aliases/default/bin/node "$HOME/Library/Application Support/fnm/aliases/default/bin/node" "$HOME"/.local/share/mise/shims/node "$HOME"/.asdf/shims/node; do
  if [ -x "$node" ]; then exec "$node" "$(dirname "$0")/backup-repos.mjs"; fi
done
osascript -e 'display notification "Node.js not found, so nothing was backed up." with title "GitHub backup"'
exit 1
`,
    { mode: 0o755 },
  );
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  mkdirSync(join(HOME, "Library/LaunchAgents"), { recursive: true });
  mkdirSync(join(HOME, "Library/Logs"), { recursive: true });
  writeFileSync(
    PLIST,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key><array><string>/bin/sh</string><string>${esc(launcher)}</string></array>
  <key>EnvironmentVariables</key><dict><key>PATH</key><string>${PATH}</string></dict>
  <key>RunAtLoad</key><true/>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>0</integer></dict>
  <key>ProcessType</key><string>Background</string>
  <key>LowPriorityIO</key><true/>
  <key>StandardOutPath</key><string>${esc(LOG)}</string>
  <key>StandardErrorPath</key><string>${esc(LOG)}</string>
</dict>
</plist>
`,
  );
  for (let attempt = 1; ; attempt++) {
    try {
      run("launchctl", ["bootstrap", domain, PLIST]);
      break;
    } catch (error) {
      if (attempt === 5) {
        console.error(`backup-repos: launchctl couldn't load the job (${(error.stderr || error.message).trim()}). Run --install again in a minute.`);
        process.exit(1);
      }
      sleep(1000);
    }
  }
  console.log(`backup-repos: runs at login and daily at noon; log in ${LOG}`);
  process.exit(0);
}

const slug = (url) => url.match(/github\.com(?::\d+)?[:/]([^/]+\/[^/]+?)(\.git)?\/?$/i)?.[1].toLowerCase();

function findClones(dir, depth = 0, found = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  const dotGit = entries.find((e) => e.name === ".git");
  if (dotGit && depth > 0) {
    if (dotGit.isDirectory()) {
      try {
        if (realpathSync(git(dir, "rev-parse", "--show-toplevel")) !== realpathSync(dir)) return found;
        const remote = slug(git(dir, "config", "--get", "remote.origin.url")) ?? slug(git(dir, "ls-remote", "--get-url", "origin"));
        if (remote) found.push({ dir, remote });
      } catch {}
    }
    return found;
  }
  if (depth >= DEPTH) return found;
  for (const e of entries) if (e.isDirectory() && !e.name.startsWith(".") && !SKIP.has(e.name)) findClones(join(dir, e.name), depth + 1, found);
  return found;
}

const problems = [];
let pulled = 0;
let cloned = 0;

const WAITS = [30000, 900000, 30000];
let repos;
for (let attempt = 0; !repos; attempt++) {
  try {
    repos = JSON.parse(run("gh", ["repo", "list", "--source", "--limit", "1000", "--json", "nameWithOwner,defaultBranchRef"]));
  } catch (error) {
    if (attempt < WAITS.length && error.code !== "ENOENT") {
      sleep(WAITS[attempt]);
      continue;
    }
    const message = (error.stderr || error.message).trim();
    log(`can't list repositories: ${message}`);
    let fails = 0;
    try {
      fails = Number(readFileSync(FAILS, "utf8")) || 0;
    } catch {}
    try {
      mkdirSync(SUPPORT, { recursive: true });
      writeFileSync(FAILS, String(fails + 1));
    } catch {}
    if (error.code === "ENOENT") notify("The GitHub CLI (gh) wasn't found, so nothing was backed up.");
    else if (/auth|login|token|401/i.test(message)) notify("gh isn't signed in, so nothing was backed up. Run `gh auth login`.");
    else if (fails + 1 === 2) notify(`Couldn't reach GitHub on the last two runs, so nothing was backed up. See ${LOG}.`);
    process.exit(0);
  }
}
try {
  unlinkSync(FAILS);
} catch {}

const clones = findClones(HOME);
const owned = new Set(repos.map((r) => r.nameWithOwner.toLowerCase()));
const resolved = new Map();
for (const clone of clones) {
  if (owned.has(clone.remote)) continue;
  if (!resolved.has(clone.remote)) {
    try {
      resolved.set(clone.remote, run("gh", ["api", `repos/${clone.remote}`, "--jq", ".full_name"]).toLowerCase());
    } catch {
      resolved.set(clone.remote, clone.remote);
    }
  }
  clone.remote = resolved.get(clone.remote);
}
const bySlug = new Map();
for (const clone of clones) bySlug.set(clone.remote, [...(bySlug.get(clone.remote) ?? []), clone.dir]);

for (const repo of repos) {
  const name = repo.nameWithOwner;
  const main = repo.defaultBranchRef?.name;
  const dirs = bySlug.get(name.toLowerCase());
  if (!dirs) {
    const dir = join(CLONE_INTO, name.split("/")[1]);
    if (existsSync(dir)) {
      problems.push(`${name}: ${dir} exists but isn't a clone of it`);
      continue;
    }
    try {
      mkdirSync(CLONE_INTO, { recursive: true });
      run("gh", ["repo", "clone", name, dir], 3600000);
      cloned++;
      log(`cloned ${name} into ${dir}`);
    } catch (error) {
      problems.push(`${name}: clone failed: ${(error.stderr || error.message).split("\n")[0]}`);
    }
    continue;
  }
  for (const dir of dirs) {
    const where = dirs.length > 1 ? `${name} (${dir})` : name;
    try {
      run("git", ["-C", dir, "fetch", "--quiet", "--prune", "origin"], 600000);
      if (!main) continue;
      try {
        git(dir, "rev-parse", "--verify", "--quiet", `refs/remotes/origin/${main}`);
      } catch {
        continue;
      }
      try {
        git(dir, "rev-parse", "--verify", "--quiet", `refs/heads/${main}`);
      } catch {
        problems.push(`${where}: no local ${main} branch`);
        continue;
      }
      const branch = git(dir, "branch", "--show-current") || "a detached HEAD";
      const [ahead, behind] = git(dir, "rev-list", "--left-right", "--count", `${main}...origin/${main}`).split(/\s+/).map(Number);
      if (ahead) problems.push(`${where}: ${ahead} local commit(s) not on GitHub`);
      if (!behind) continue;
      if (branch !== main) problems.push(`${where}: on ${branch}, ${main} is ${behind} behind`);
      else if (git(dir, "status", "--porcelain", "--ignore-submodules")) problems.push(`${where}: uncommitted changes, ${behind} new commit(s) not pulled`);
      else if (!ahead) {
        run("git", ["-C", dir, "-c", "core.hooksPath=/dev/null", "merge", "--quiet", "--ff-only", "--no-overwrite-ignore", `origin/${main}`], 600000);
        pulled++;
        log(`pulled ${behind} commit(s) into ${dir}`);
      }
    } catch (error) {
      problems.push(`${where}: ${(error.stderr || error.message).split("\n").slice(0, 2).join(" ").replace(/\s+/g, " ").trim()}`);
    }
  }
}

for (const p of problems) log(p);
log(`${repos.length} repositories: ${pulled} pulled, ${cloned} cloned, ${problems.length} need a look`);

const summary = problems.map((p) => p.replace(/\d+/g, "#")).sort().join("\n");
let last = "";
try {
  last = readFileSync(STATE, "utf8");
} catch {}
try {
  mkdirSync(SUPPORT, { recursive: true });
  writeFileSync(STATE, summary);
} catch {}
const done = [pulled && `pulled ${pulled}`, cloned && `cloned ${cloned}`].filter(Boolean).join(", ");
if (problems.length && summary !== last) notify(`${done ? `${done}; ` : ""}${problems.length} need a look: ${problems.join("; ")}`);
else if (done) notify(`Backed up: ${done}`);
