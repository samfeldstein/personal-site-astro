---
layout: ../../layouts/BaseLayout.astro
---

# Coursera Challenge: Use Linux Commands to Manage File Permissions

Completed on **May 07, 2025**. You can find the complete assignment on [Coursera's website](https://www.coursera.org/learn/linux-and-sql/assignment-submission/3qweg/portfolio-activity-use-linux-commands-to-manage-file-permissions/attempt).

**Assignment:** Demonstrate your experience using Linux commands to manage file permissions.

## Scenario

You are a security professional at a large organization. You mainly work with their research team. Part of your job is to ensure users on this team are authorized with the appropriate permissions. This helps keep the system secure.

Your task is to examine existing permissions on the file system. You’ll need to determine if the permissions match the authorization that should be given. If they do not match, you’ll need to modify the permissions to authorize the appropriate users and remove any unauthorized access.

## Assignment

### Check file and directory details

Run `ls -l`.

Output:

```bash
drwx--x--- 2 researcher2 research_team 4096 May  7 20:56 drafts
-rw-rw-rw- 1 researcher2 research_team   46 May  7 20:56 project_k.txt
-rw-r----- 1 researcher2 research_team   46 May  7 20:56 project_m.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_r.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_t.txt
```

### Change file permissions

*The organization does not allow others to have write access to any files. The shell output shows that others have access to `project_k.txt`.*

Run `chmod o-w project_k.txt`.

Output:

```bash
drwx--x--- 2 researcher2 research_team 4096 May  7 20:56 drafts
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_k.txt
-rw-r----- 1 researcher2 research_team   46 May  7 20:56 project_m.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_r.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_t.txt
```

### Change file permissions on a hidden file

*The research team has archived **.project_x.txt**, which is why it’s a hidden file. This file should not have write permissions for anyone, but the user and group should be able to read the file.*

Run `ls -la`.

Output:

```bash
drwxr-xr-x 3 researcher2 research_team 4096 May  7 20:56 .
drwxr-xr-x 3 researcher2 research_team 4096 May  7 21:39 ..
-rw--w---- 1 researcher2 research_team   46 May  7 20:56 .project_x.txt
drwx--x--- 2 researcher2 research_team 4096 May  7 20:56 drafts
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_k.txt
-rw-r----- 1 researcher2 research_team   46 May  7 20:56 project_m.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_r.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_t.txt
```

Users and groups currently have write permissions. Run `chmod u=r,g=r .project_x.txt`.

Output:

```bash
drwxr-xr-x 3 researcher2 research_team 4096 May  7 20:56 .
drwxr-xr-x 3 researcher2 research_team 4096 May  7 21:39 ..
-r--r----- 1 researcher2 research_team   46 May  7 20:56 .project_x.txt
drwx--x--- 2 researcher2 research_team 4096 May  7 20:56 drafts
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_k.txt
-rw-r----- 1 researcher2 research_team   46 May  7 20:56 project_m.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_r.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_t.txt
```

Write permissions for `.project_x.txt` have been removed.

### Change directory permissions

*The files and directories belong to the **researcher2** user. Only **researcher2** should be allowed to access the **drafts** directory and its contents.*

Currently, groups have executable access to the `drafts` directory. Run `chmod g-x drafts`.

Output:

```bash
drwx------ 2 researcher2 research_team 4096 May  7 20:56 drafts
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_k.txt
-rw-r----- 1 researcher2 research_team   46 May  7 20:56 project_m.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_r.txt
-rw-rw-r-- 1 researcher2 research_team   46 May  7 20:56 project_t.txt
```

Group executable permissions for `drafts` have been removed.
