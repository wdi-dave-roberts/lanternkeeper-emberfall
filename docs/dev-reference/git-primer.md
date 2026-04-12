# Git Primer

Git tracks changes to files. It lets you save snapshots of your work, undo mistakes, and collaborate without overwriting each other.

This page covers what you need to know to contribute to lanternkeeper-emberfall.

---

## What Git Does

Every time you make a commit, Git saves a snapshot of your changes. You can go back to any snapshot. You can work on a separate copy of the code (a branch) without affecting the main version. And when you push, your changes go up to GitHub where others can see them.

Think of it as a save system for code — but one where every save is labeled and reversible.

---

## The Basic Workflow

These four commands cover most of what you'll do day to day.

**1. See what changed**
```bash
git status
```
Shows which files have been modified, added, or deleted. Run this often — it's harmless and keeps you oriented.

**2. Stage your changes**
```bash
git add src/data/feedback.ts
```
Staging means telling Git "include this file in my next commit." You can stage individual files or multiple at once. Staging lets you be intentional about what goes into each commit.

**3. Save a snapshot**
```bash
git commit -m "feat(feedback): add 3 new alright feedback lines"
```
A commit saves your staged changes with a message describing what changed. See [Contributing](contributing.md) for commit message format.

**4. Send to GitHub**
```bash
git push
```
Pushes your commits to GitHub so they're backed up and visible to others.

---

## Branches

A branch is a separate line of work. Changes on a branch don't affect `master` (the main version) until you merge them.

**Create a new branch:**
```bash
git checkout -b my-feature
```

**Switch to an existing branch:**
```bash
git checkout master
```

**See which branch you're on:**
```bash
git branch
```

A good habit: create a branch for each meaningful chunk of work. That way, if something goes wrong, you can discard the branch without losing anything on `master`.

---

## Common Situations

**"I want to see exactly what I changed in a file"**
```bash
git diff
```
Shows line-by-line differences between your working copy and the last commit. Lines starting with `+` are additions, `-` are removals.

**"I want to undo changes to a file (before committing)"**
```bash
git checkout -- src/data/feedback.ts
```
Reverts the file to its last committed state. This is permanent — unsaved changes are gone.

**"I made a typo in my last commit message"**
```bash
git commit --amend
```
Opens an editor to rewrite the last commit message. Only use this before pushing — amending after pushing causes problems.

**"I need the latest changes from GitHub"**
```bash
git pull
```
Fetches and merges changes from the remote branch into your local branch. Run this before starting new work to make sure you're up to date.

**"I want to see recent commits"**
```bash
git log --oneline -10
```
Shows the last 10 commits as a compact list with hashes and messages.

---

## GitHub

GitHub is the website where the lanternkeeper-emberfall code lives: [github.com/wdi-dave-roberts/lanternkeeper-emberfall](https://github.com/wdi-dave-roberts/lanternkeeper-emberfall).

When you push a branch, you can open a **pull request** on GitHub. A pull request is a proposal to merge your branch into `master`. It shows the diff, allows comments, and gives Dave a chance to review before the code is merged.

You don't need to use pull requests for every change — but for significant additions or anything touching the core loop, it's a good practice.

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `git status` | Show what has changed |
| `git diff` | Show line-by-line changes |
| `git add <file>` | Stage a file for commit |
| `git commit -m "..."` | Save a snapshot with a message |
| `git push` | Send commits to GitHub |
| `git pull` | Get the latest changes from GitHub |
| `git checkout -b <name>` | Create and switch to a new branch |
| `git checkout <branch>` | Switch to an existing branch |
| `git log --oneline -10` | See recent commits |
