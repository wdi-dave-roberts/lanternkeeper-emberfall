---
title: "What's Changed"
---

# What's Changed

This page tracks every meaningful change to Lanternkeeper: Emberfall. Generated from CHANGELOG.md — updated weekly.

<!-- GENERATED CONTENT BELOW -- do not edit manually. Run scripts/generate_whats_changed.py to regenerate. -->

## April 12, 2026

### Project infrastructure is in place

Hey Allie — before touching any game code, I set up the technical foundation so we have a clean starting point going forward.

**What happened:**

- **This docs site** now exists and auto-deploys when we push to master. Everything about the game's design — pillars, voice rules, core loop, quests — is documented here so we always have a reference.
- **CLAUDE.md** (the file that tells Claude how to work on our project) was cleaned up and slimmed down. It used to have all 40 quests and 20 feedback lines pasted directly in it. Now it just points to `src/data/` where that content actually lives. Less clutter, same rules.
- **A changelog system** is running so we can track what changes over time without guessing.

**What did NOT change:**

- No game mechanics were touched
- No quest text was edited
- No feedback lines were changed
- No screen layouts or animations were modified
- `src/data/quests.ts` and `src/data/feedback.ts` are exactly as you left them

This was all behind-the-scenes setup. Your game code is untouched.
