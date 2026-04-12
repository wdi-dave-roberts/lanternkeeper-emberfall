# Changelog

AI state journal for Lanternkeeper: Emberfall. Each entry captures what changed, the resulting state, and constraints on future work. Reverse chronological.

For the human-readable narrative, see [What's Changed](https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/whats-changed/) on the docs site.

---

## 2026-04-12

### Project Infrastructure -- Milestone Start

#### Docs site created
- **Changed:** Built a docs site using MkDocs Material with GitHub Pages deployment. 13 pages covering game design (pillars, voice rules, core loop, quests, feedback) and dev reference (architecture, conventions, contributing, Git primer, GSD workflow). Auto-deploys on every push to master.
- **State now:** Docs site live at https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/. This is the canonical teaching reference for the project.
- **Constrains:** Docs site is the full reference; CLAUDE.md stays terse. New game design decisions get documented in the docs site, not in CLAUDE.md.

#### Game content removed from CLAUDE.md
- **Changed:** Removed all 40 micro-quests and all 20 feedback lines that were pasted directly into claude.md. Replaced with 3 file pointers (`src/data/quests.ts`, `src/data/feedback.ts`, `src/data/types.ts`) and a no-duplicate rule. Renamed `claude.md` to `CLAUDE.md`.
- **State now:** Game content lives exclusively in `src/data/`. CLAUDE.md contains only terse project constraints, design pillar summaries, voice rules (as constraints, not full catalog), and implementation rules. The docs site holds the full teaching versions.
- **Constrains:** Never duplicate quest or feedback content into CLAUDE.md. If Claude needs game content, it reads `src/data/`. No game parameters, dialogue, or mechanics were changed -- only where the content is referenced from.

#### Cross-project contamination cleaned up
- **Changed:** Found and removed references to "Godot architecture docs" in planning artifacts (REQUIREMENTS.md, PROJECT.md, ROADMAP.md). This was a copy-paste leak from a different project (laternfall) -- those docs never existed in this repo.
- **State now:** Planning artifacts accurately reflect this project's actual history and content.
- **Constrains:** Historical phase artifacts (CONTEXT.md, RESEARCH.md) preserved unchanged -- they document the discovery trail.

#### Changelog and tracking pipeline added
- **Changed:** Created CHANGELOG.md with AI state journal format and a weekly auto-generation script that produces a human-readable What's Changed page on the docs site.
- **State now:** Every meaningful change gets a structured entry (Changed / State now / Constrains). What's Changed page on docs site gives Allie a plain-English summary.
- **Constrains:** Do not manually edit `docs/whats-changed.md` below the GENERATED marker. ANTHROPIC_API_KEY repo secret needed for auto-generation.
