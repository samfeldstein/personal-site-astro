---
title: Building an Automatic File-Mover with ChatGPT
description: Nothing special.
pubDate: 2023-12-16T08:53:53-06:00
tags: ["ai", "programming", "python", "tools"]
---

Once a month I back up my Goodreads library to a folder on my computer called `exports`. The process: Go to the website, find the Export button, download the file, open the terminal, move the file from `Downloads` to `exports`. It's not enough of a pain for me not to do it, but it is enough of a pain for me to try to make it easier. I figured there had to be an extant solution, but rather than hunt around the internet for an appropriate application, I decided to build one myself.

The thing is, I don't know any Python. I barely know JavaScript. So I turned to ChatGPT for help, and short story short, it was really easy. The app is very simple. All it does is check my computer's `Downloads` folder for a specific file (in this case, `goodreads*.csv`)and move it to the `exports` folder.

Slightly more complicated (remember that I'm new to all this) was setting the application to run automatically once a month. You do that with something called a "cron job". To schedule a cron job, you first open the "crontab" with `crontab -e`. Then you enter the interval, the path to the Python interpreter, and the path to the application. Like so:

```shell
0 0 1 * * usr/bin/python3 /Users/User/path/to/file-mover/script.py
```

The first interval field represents minutes. Setting it to `0` tells the application to run at the top of the hour. The second field represents hours. Setting it to `0` tells the app to run at midnight. The third field represents days. Setting it to `1` tells the app to run on the first day of the month. The fourth field represents months. Setting it to `*` tells the app to run every month. The fifth field represents the day of the week. Setting it to `*` allows the app to run on any given day. Taken together, this tells the app to run at midnight on the first day of each month.

Now the process from before has been reduced to a single step. All I have to do is download the export file from Goodreads, and the app handles the rest.

You can see the code on [GitHub](https://github.com/seldstein/file-mover).
