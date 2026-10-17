# Backing up GitHub repos to my Mac

Most of my projects are worked on by Claude Code in the cloud, straight from GitHub, so my Mac can fall behind. One script, `backup-repos.mjs`, keeps a local copy of every repo I own up to date. It runs once for the whole computer, so new projects are covered without any setup.

## What it does

It runs at login and every day at noon (or when the Mac wakes, if it slept through noon).

- **Repos I already have** anywhere under my home folder, up to five folders deep (for example `~/projects/dev/sites/` and `~/projects/dev/apps/`), are fetched. The default branch (usually main) is pulled only when it's checked out, has no uncommitted changes, and has no commits that aren't on GitHub.
- **Repos not on the Mac yet** are cloned into `~/GitHub`.
- **Anything it can't pull safely** is left alone and reported: a repo on another branch, uncommitted changes, unpushed commits, or a pull that would overwrite a local file (even a gitignored one like `.env`).
- **Notifications** appear when it pulls or clones something, and when a new problem appears, not every day for the same one.
- **If GitHub can't be reached** it tries twice, waits 15 minutes, tries twice more, then waits for the next run. If that happens two runs in a row, or gh is missing or signed out, it notifies me.

It skips Desktop, Documents, Downloads, Library and the other system folders, so macOS doesn't ask for folder access. It doesn't follow symlinks, and only recognises remotes that say `github.com` (not SSH host aliases). A repo it can't find gets a second copy in `~/GitHub`, which is harmless but worth knowing.

## Setup (once per Mac)

1. Install the GitHub CLI and sign in: `gh auth login`.
2. Run `node backup-repos.mjs --install` from wherever the file is.

The first run clones every repo I own that isn't on the Mac yet, private and archived ones included (forks are skipped), so it takes a while.

## Where things live

- Script: `~/Library/Application Support/backup-repos/` (install copies it there, so the original can be deleted)
- Schedule: `~/Library/LaunchAgents/dev.backup-repos.plist`
- Log: `~/Library/Logs/dev.backup-repos.log`
- New clones: `~/GitHub/`

## Commands

- Run it now: `node ~/Library/Application\ Support/backup-repos/backup-repos.mjs`
- Remove it: `node ~/Library/Application\ Support/backup-repos/backup-repos.mjs --uninstall`
- Check what happened: `tail ~/Library/Logs/dev.backup-repos.log`

## When a repo needs a look

The log names the repo and the reason. In that repo's folder:

- **"local commit(s) not on GitHub"**: the only copy of that work is on the Mac. See it with `git log origin/main..main`, then `git push` (or delete the branch if it's abandoned).
- **"uncommitted changes, N new commit(s) not pulled"**: see what changed with `git status`. Commit or stash, then `git pull`.
- **"on <branch>, main is N behind"**: `git switch main && git pull`, or leave it; nothing is lost, main just isn't updated.
- **"would be overwritten by merge"**: a local file (often a gitignored one like `.env`) is in the way of a file on GitHub. Move it aside, `git pull`, and merge the two by hand.

## Also

Projects with a Claude Code `SessionStart` hook (like the personal site's `.claude/hooks/pull.mjs`) pull main whenever I start Claude Code there, which covers the gap between scheduled runs.
