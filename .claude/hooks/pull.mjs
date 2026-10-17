import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "../..");
const background = process.argv.includes("--background");
const LABEL = "xyz.samfeldstein.pull";
const PLIST = join(homedir(), "Library/LaunchAgents", `${LABEL}.plist`);

if (process.argv.includes("--install") || process.argv.includes("--uninstall")) {
  if (process.platform !== "darwin") {
    console.error("pull: --install sets up a macOS launchd job; on other systems, run `node .claude/hooks/pull.mjs --background` daily with cron.");
    process.exit(1);
  }
  const uid = process.getuid();
  try {
    execFileSync("launchctl", ["bootout", `gui/${uid}/${LABEL}`], { stdio: "ignore" });
  } catch {}
  if (process.argv.includes("--uninstall")) {
    if (existsSync(PLIST)) unlinkSync(PLIST);
    console.log("pull: daily pull removed");
    process.exit(0);
  }
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  mkdirSync(dirname(PLIST), { recursive: true });
  writeFileSync(
    PLIST,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${esc(process.execPath)}</string>
    <string>${esc(fileURLToPath(import.meta.url))}</string>
    <string>--background</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string></dict>
  <key>RunAtLoad</key><true/>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>${esc(join(homedir(), "Library/Logs", `${LABEL}.log`))}</string>
  <key>StandardErrorPath</key><string>${esc(join(homedir(), "Library/Logs", `${LABEL}.log`))}</string>
</dict>
</plist>
`,
  );
  execFileSync("launchctl", ["bootstrap", `gui/${uid}`, PLIST]);
  console.log(`pull: this copy now pulls main from GitHub at login and once a day (log: ~/Library/Logs/${LABEL}.log)`);
  process.exit(0);
}

if (!background && process.env.CLAUDE_CODE_REMOTE === "true") process.exit(0);

const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", timeout: 20000, stdio: ["ignore", "pipe", "pipe"] }).trim();
const say = (message, quiet = false) => {
  if (background) {
    console.log(`${new Date().toISOString()} ${message}`);
    if (!quiet && process.platform === "darwin") {
      try {
        execFileSync("osascript", ["-e", `display notification ${JSON.stringify(message)} with title "Personal site"`]);
      } catch {}
    }
  } else {
    console.log(JSON.stringify({ systemMessage: message, hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: message } }));
  }
  process.exit(0);
};

try {
  git("fetch", "--quiet", "origin");
} catch {
  say("git: couldn't reach GitHub, so this copy may be out of date.", background);
}

const branch = git("branch", "--show-current");
const [ahead, behind] = git("rev-list", "--left-right", "--count", "HEAD...origin/main").split(/\s+/).map(Number);
const dirty = git("status", "--porcelain") !== "";

if (branch !== "main") say(`git: on branch ${branch}, not main; main on GitHub is ${behind} commit(s) ahead of it.`, background && !behind);
if (ahead && behind) say(`git: local main and GitHub have both changed (${ahead} local, ${behind} on GitHub). Pull and resolve by hand.`);
if (ahead) say(`git: ${ahead} commit(s) on this computer aren't on GitHub yet. Push them to back them up.`);
if (!behind) {
  if (background) say("git: up to date.", true);
  process.exit(0);
}
if (dirty) say(`git: GitHub has ${behind} new commit(s), but there are uncommitted changes here, so nothing was pulled.`);

try {
  git("pull", "--quiet", "--ff-only", "origin", "main");
  say(`git: pulled ${behind} new commit(s) from GitHub.`);
} catch (error) {
  say(`git: pulling ${behind} new commit(s) failed: ${error.stderr || error.message}`);
}
