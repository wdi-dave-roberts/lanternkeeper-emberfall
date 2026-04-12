# Contributing

Welcome. This guide is written for Allie — and anyone else who wants to contribute to Lanternkeeper: Emberfall.

The most important thing to know before writing a single line: this app has a design philosophy. Read it first.

---

## Before You Code

Read the [Design Pillars](../game-design/pillars.md) page.

Every change must pass the Emotional Acceptance Gate:

> Does this make the user feel more understood, more inspired, or less pressured?

If the answer is no to all three, do not build it.

This isn't bureaucracy. It's the reason the app exists. A well-intentioned change that accidentally introduces pressure (a streak counter, a "you haven't checked in recently" prompt, a time-limited quest) can undermine everything the app is trying to do. The pillars page has concrete examples of what violates each pillar — read it before making any change to the core loop.

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Open Expo Go on your phone and scan the QR code in the terminal.

That's it. The app runs entirely on your device — no server, no account needed.

---

## Making Changes

- Make one small change at a time. Don't refactor the whole project in one go.
- Test on your device after each change. The simulator is useful but touch feel matters.
- If something feels wrong — if a change makes the app feel more pressured, less warm, or harder to use — stop and talk about it. That instinct is data.

---

## Voice Changes

Any change to Aetherling's dialogue or feedback lines requires a voice review.

Before merging, check every new or edited line against the [Aetherling's Voice](../game-design/voice.md) page:

- Does it follow all 5 language rules? (short sentences, no exclamation points, no slang, no emojis, no motivational cliches)
- Does it match at least 3 of 5 tone qualities? (calm, dry, warm-under-the-surface, respectful, non-performative)

Feedback line content lives in `src/data/feedback.ts`. That file is the source of truth.

---

## Commit Messages

Use this format:

```
type(scope): description
```

**Types:**

| Type | When to use |
|------|------------|
| `feat` | New feature or screen |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code cleanup with no behavior change |
| `test` | Adding or updating tests |
| `chore` | Dependencies, config, maintenance |

**Rules:**
- Keep the subject line under 72 characters
- Use imperative mood: "add emotion check" not "added emotion check"
- Scope is optional but helpful: `feat(quests): add winter themed quests`

**Examples:**
```
feat(feedback): add 3 new alright feedback lines
fix(storage): handle missing world-state key gracefully
docs(voice): add examples of lines that fail review
```

---

## The Final Rule

If a change doesn't make the user feel more understood, more inspired, or less pressured — don't build it.

This applies to every commit: features, bug fixes, visual tweaks, and content changes alike. If you're unsure, ask.
