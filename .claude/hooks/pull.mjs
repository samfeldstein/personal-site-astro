import { execFileSync } from "node:child_process";

if (process.env.CLAUDE_CODE_REMOTE === "true") process.exit(0);

const git = (...args) => execFileSync("git", args, { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] }).trim();
const say = (message) => {
  console.log(JSON.stringify({ systemMessage: message, hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: message } }));
  process.exit(0);
};

try {
  git("fetch", "--quiet", "origin");
} catch {
  say("git: couldn't reach GitHub, so this copy may be out of date.");
}

const branch = git("branch", "--show-current");
const [ahead, behind] = git("rev-list", "--left-right", "--count", "HEAD...origin/main").split(/\s+/).map(Number);
const dirty = git("status", "--porcelain") !== "";

if (branch !== "main") say(`git: on branch ${branch}, not main; main on GitHub is ${behind} commit(s) ahead of it.`);
if (ahead && behind) say(`git: local main and GitHub have both changed (${ahead} local, ${behind} on GitHub). Pull and resolve by hand.`);
if (ahead) say(`git: ${ahead} commit(s) on this computer aren't on GitHub yet. Push them to back them up.`);
if (!behind) process.exit(0);
if (dirty) say(`git: GitHub has ${behind} new commit(s), but there are uncommitted changes here, so nothing was pulled.`);

try {
  git("pull", "--quiet", "--ff-only", "origin", "main");
  say(`git: pulled ${behind} new commit(s) from GitHub.`);
} catch (error) {
  say(`git: pulling ${behind} new commit(s) failed: ${error.stderr || error.message}`);
}
