# Micro-Quests

40 small, kind tasks grouped by emotion. No pressure. No guilt. Just one small thing.

---

## Philosophy

A micro-quest is not an assignment. It is an invitation.

Each quest is designed to be completable in under 5 minutes, require no special tools, never feel like homework, and validate the emotion the user is experiencing rather than trying to fix it. A Stuck quest doesn't try to make the user feel Inspired — it gives them one tiny foothold in the place they already are.

---

## The Four Emotion Categories

| Emotion | Count | What these quests aim to do |
|---------|-------|-----------------------------|
| Stuck | 10 | Help the user take one tiny step without requiring momentum |
| Frustrated | 10 | Help the user release tension kindly and make a little space |
| Inspired | 10 | Help the user act on their spark before it fades |
| Alright | 10 | Help the user enjoy the steadiness without needing to do more |

---

## Examples

### Stuck

Stuck quests meet the user where they are — not moving — and offer the smallest possible invitation forward.

- "Open your project for 2 minutes."
- "Write one sentence about what feels blocked."
- "Name one small thing you have already built."

### Frustrated

Frustrated quests aim to reduce tension, not solve the problem. They are physical, kind, and small.

- "Put a hand on your chest. Breathe slowly for 3 breaths."
- "Stretch your shoulders for 30 seconds."
- "Write one honest sentence about why this matters."

### Inspired

Inspired quests protect the spark. They help the user do something with the energy before it dissipates.

- "Write one mechanic idea."
- "Build one imperfect thing."
- "Capture today's idea before it fades."

### Alright

Alright quests honor steadiness. They don't push for more — they help the user be present with what's working.

- "Enjoy one simple comfort."
- "Thank yourself for showing up."
- "Rest for 5 minutes without guilt."

---

## Source of Truth

> The complete quest catalog lives in [`src/data/quests.ts`](https://github.com/wdi-dave-roberts/lanternkeeper-emberfall/blob/master/src/data/quests.ts). That file is the source of truth — this page is the design reference.

---

## Guidelines for Writing New Quests

When adding a quest to `src/data/quests.ts`, apply these criteria:

1. **Completable in under 5 minutes** — if it takes longer, it's a task, not a quest
2. **No special tools required** — no equipment, no app, no setup
3. **Never feels like homework** — if it creates obligation or guilt when skipped, revise it
4. **Validates the emotion, doesn't fix it** — a Frustrated quest doesn't try to make the user feel Inspired; it acknowledges the frustration and offers one small, kind thing to do with it
5. **Fits the voice** — brief, direct, no exclamation points. See [Aetherling's Voice](voice.md) for language rules.
