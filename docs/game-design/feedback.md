# Feedback Lines

These are Aetherling's responses after a quest is completed. They follow the voice rules. They acknowledge what happened without over-celebrating it.

A feedback line is not a reward. It is a quiet close to the loop.

---

## Examples

### Stuck

| Line | Why it works |
|------|-------------|
| "Fog lost a little ground." | Uses the game's own metaphor. Acknowledges progress without praising the user. |
| "Small steps count." | Direct, unpretentious. Validates the tininess of the action rather than inflating it. |

### Frustrated

| Line | Why it works |
|------|-------------|
| "That made space." | Acknowledges the physical or emotional action without labeling what the user was feeling. |
| "We kept it kind." | Uses "we" — Aetherling was present. Warm under the surface without announcing it. |

### Inspired

| Line | Why it works |
|------|-------------|
| "One piece became real." | Concrete. Honors the creative act without over-celebrating it. |
| "We built today." | Brief, steady. Includes Aetherling in the act. |

### Alright

| Line | Why it works |
|------|-------------|
| "Nothing to prove." | Removes pressure without explaining why. Trusts the user to receive it. |
| "That was enough." | Simple. Closes the loop without asking for more. |

---

## Source of Truth

> The complete feedback line catalog lives in [`src/data/feedback.ts`](https://github.com/wdi-dave-roberts/lanternkeeper-emberfall/blob/master/src/data/feedback.ts). That file is the source of truth.

---

## Guidelines for Writing New Feedback Lines

When adding a feedback line to `src/data/feedback.ts`, apply these criteria:

1. **3-8 words** — brevity is the tone. Longer lines dilute the effect.
2. **Use "we" not "you" when possible** — Aetherling is a companion, not a judge. "We built today" feels like presence; "You built today" feels like assessment.
3. **No exclamation points** — ever.
4. **Must pass the voice review** — all 5 language rules, at least 3 of 5 tone qualities. See [Aetherling's Voice](voice.md) for the full review convention.
5. **Acknowledge, don't praise** — the line should close the loop, not grade the performance. The user doesn't need a gold star; they need a quiet nod.
