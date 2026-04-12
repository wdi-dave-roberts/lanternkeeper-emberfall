---
title: "What's Changed"
---

# What's Changed

This page tracks every meaningful change to Lanternkeeper: Emberfall. Generated from CHANGELOG.md — updated weekly.

<!-- GENERATED CONTENT BELOW -- do not edit manually. Run scripts/generate_whats_changed.py to regenerate. -->

## April 12, 2026

### Project infrastructure is in place

Hey Allie — before touching any game code, I set up the technical foundation so we have a clean starting point going forward.

**This docs site now exists.** It auto-deploys when we push to master. Everything about the game's design — pillars, voice rules, core loop, quests — is documented here so we always have a reference. There's also a Dev Reference section with a Git primer, architecture overview, and contributing guide written for you.

**CLAUDE.md got cleaned up.** It used to have all 40 quests and 20 feedback lines pasted directly in it. That was a lot of clutter for an instructions file. Now it just points to `src/data/` where that content actually lives — same rules, less noise. Also renamed `claude.md` → `CLAUDE.md` to match our naming convention.

**Cleaned up some cross-project confusion.** A few planning documents referenced "Godot architecture docs" that were supposed to be merged in. Those docs never existed — it was a copy-paste mix-up from a different project. Removed those references so our planning files are accurate.

**A changelog system is running.** This What's Changed page and the CHANGELOG.md file track what happens over time so neither of us has to guess what changed or why.

---

**What did NOT change:**

- No game mechanics were touched
- No quest text was edited
- No feedback lines were changed
- No screen layouts or animations were modified
- `src/data/quests.ts` and `src/data/feedback.ts` are exactly as you left them

This was all behind-the-scenes setup. Your game code is untouched.
