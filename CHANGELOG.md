# Changelog

AI state journal for Lanternkeeper: Emberfall. Each entry captures what changed, the resulting state, and constraints on future work. Reverse chronological.

For the human-readable narrative, see [What's Changed](https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/whats-changed/) on the docs site.

---

## 2026-04-12

### Project Infrastructure -- Milestone Start
- **Changed:** Added MkDocs docs site with Material theme, GitHub Pages deployment, CHANGELOG, and reconciled CLAUDE.md. Corrected DOCS-01 requirement (no Godot content exists -- was a cross-project leak from laternfall). Renamed claude.md to CLAUDE.md.
- **State now:** Docs site live at https://wdi-dave-roberts.github.io/lanternkeeper-emberfall/. CHANGELOG.md is the running state journal. CLAUDE.md is the single source of truth for project constraints, pointing to src/data/ for game content and docs site for teaching reference. Game content (40 quests, 20 feedback lines) lives exclusively in src/data/.
- **Constrains:** Do not manually edit docs/whats-changed.md (generated). Do not duplicate quest/feedback content in CLAUDE.md. All future changes must satisfy at least one design pillar.
