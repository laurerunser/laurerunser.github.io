+++
author = "Laure Runser"
title = "Should I commit the themes submodules?"
date = "2023-09-04"
description = "How to handle submodules in a project"
tags = [
    "hugo"
]
+++

Hugo allows you to use themes to style your website, and the preferred way to install a theme someone else made is to use a submodule.
But how should I handle them in the context of git? Do I commit everything into my repo? None of it?

<!--more-->

## What is a submodule?

Submodules allow you to import and use another git repo inside of your current project.

If you're working on project `A`, but need to use another git repo `B` inside, you can made `B` a submodule of `A`.
Then, you'll have access to all the code of `B`.

## Why use submodules?

If you just need to access the code of `B`, the easiest solution is to use a package management software and to make `B` a dependency of `A`.

Submodules are useful when you need to concurrently work on both projects, or when they are using each other mutually.
With submodules, the commit history for `A` and `B` are separate. When you make changes inside of `B` and you commit them, they will not appear in the history of `A`. That way, you can work on both without muddling the histories.

You can push and pull to/from `B` to get the lastest version of the code, without impacting `A` (and vice-versa).

## The `.submodules` file

Git uses the `.submodules` file to keep track of wich directories are submodules and where their remote is.

This allows other users to find which submodules you used and to download the code for themselves.
For eg. `git clone --recurse-submodules URL` clones a repo and fetches all the submodules (and their submodules recursively).

The code of submodule `B` is not included in the code of the bigger project `A`, and won't be committed or pushed (because the histories are kept separate). So in the remote git repo, you will only see the `.submodules` file and an empty directory for `B`.

## Should I commit the submodule directory and files?

You should commit the `.submodules` file and the empty directory for the theme.

In the github webui, if won't show as an empty directory, but as a link to the remote (if it's on github).
That way, you can easily navigate to the source code of the submodules if needed.

![Example of git UI](/git_submodule_example.png)

You should't commit the files inside of the submodule. They'll appear as `untracked` if you place yourself in the `themes` dir (or any other dir of the parent project), and as `tracked` inside of the submodule folder.

## Links

[official doc](https://git-scm.com/book/en/v2/Git-Tools-Submodules)  
[github blog post about submodules](https://github.blog/2016-02-01-working-with-submodules/)
