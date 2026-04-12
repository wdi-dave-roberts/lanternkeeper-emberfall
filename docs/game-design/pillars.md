# Design Pillars

These three pillars are the promises the game makes to every person who opens it. Every change must satisfy at least one. If a change violates any pillar, it does not ship.

---

## Understood

**What it means:** The app mirrors the user's actual emotional state without judgment or correction. It doesn't tell the user how they should feel or push them toward a "better" emotion. It meets them exactly where they are.

**What it looks like in the app:**
- Four emotion options (Stuck, Frustrated, Inspired, Alright) are presented without hierarchy — no option is the "right" answer
- Quests are tailored to the selected emotion rather than trying to shift the user out of it

**Pillar check (before any change):**
> Does this change respond to the user's actual emotional state, or does it impose an assumption about what they should be feeling?

**What violates this pillar:**
- Suggesting the user "try to feel Inspired today"
- Hiding or de-emphasizing Frustrated or Stuck as options
- Adding dialogue that questions or second-guesses the emotion the user selected
- Prompting the user to rate their mood on a scale (implies there's a better number to hit)

---

## Inspired

**What it means:** The app protects and nurtures the user's creative momentum. It treats the user's work as meaningful. It helps them return to their project with slightly more energy than they arrived with — or at least without having lost any.

**What it looks like in the app:**
- Micro-quests for Inspired emotion help the user act on their spark immediately (write one mechanic idea, sketch one character)
- Feedback lines after quest completion acknowledge the creative act without over-celebrating it

**Pillar check (before any change):**
> Does this change protect the user's creative momentum, or does it add friction between the user and their work?

**What violates this pillar:**
- Adding a "weekly goal" feature that implies the user must hit a target
- Requiring the user to log what they worked on before accessing the app
- Notifications that interrupt flow or create guilt when dismissed
- Any mechanic that makes the user feel they are behind on something

---

## Less Pressured

**What it means:** There are no streaks, no penalties, no countdowns, and no comparisons. Time is neutral. Rest is normal. The app feels the same whether the user opened it yesterday or three weeks ago.

**What it looks like in the app:**
- No streak counter exists in the app
- Days since last visit are not displayed
- Returning after a long absence produces no guilt mechanic, no "we missed you" pressure prompt
- Region unlocks accumulate over time but do not expire or reset

**Pillar check (before any change):**
> Does this change introduce any time-based mechanic, streak, penalty, countdown, or comparison between the user and a goal or average?

**What violates this pillar:**
- Adding a streak counter (even a visual one, even if there's "no penalty for breaking it")
- Showing "days since last check-in"
- Making quest completion time-limited ("complete this before midnight")
- Ranking emotions or showing which emotion the user picks most often
- A progress bar that depletes or resets when the user doesn't open the app
- Any "comeback" message that implies the user should have returned sooner

---

## Emotional Acceptance Gate

Before merging any change, ask:

> Does this make the user feel more understood, more inspired, or less pressured?

If the answer is no to all three, do not build it.

This is not a checklist to optimize — it is a gate. A change that scores neutral on all three pillars has no reason to exist. A change that actively violates any pillar must be redesigned or dropped.

When in doubt, err toward doing less. Simplicity is not a compromise — it is the point.
